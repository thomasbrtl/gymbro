// ══════════════════════════════════════════════════════════════════
//  GYMBRO — App.jsx  (Supabase integration — offline-first)
// ══════════════════════════════════════════════════════════════════
import { useState, useEffect, useCallback } from 'react'
import { supabase } from './supabase.js'
import GymbroOffline from './gymbro.jsx'

function Loader() {
  return (
    <div style={{minHeight:'100vh',background:'#0A0A0F',display:'flex',alignItems:'center',justifyContent:'center',flexDirection:'column',gap:16}}>
      <div style={{fontSize:52}}>🏋️</div>
      <div style={{color:'#FF3D3D',fontSize:24,fontWeight:900,fontFamily:"'Barlow Condensed',sans-serif"}}>GYM<span style={{color:'#F0F0F0'}}>BRO</span></div>
      <div style={{width:36,height:36,border:'3px solid #FF3D3D33',borderTopColor:'#FF3D3D',borderRadius:'50%',animation:'spin .8s linear infinite'}}/>
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}*{box-sizing:border-box}`}</style>
    </div>
  )
}

// ── Storage ──
async function uploadMedia(file, userId) {
  try {
    const ext = file.name.split('.').pop() || 'jpg'
    const path = `${userId}/${Date.now()}.${ext}`
    const { error } = await supabase.storage.from('gymbro-media').upload(path, file)
    if (error) return null
    const { data } = supabase.storage.from('gymbro-media').getPublicUrl(path)
    return data.publicUrl
  } catch { return null }
}

function dataURLtoFile(dataUrl, filename) {
  if (!dataUrl?.startsWith('data:')) return null
  try {
    const [header, b64] = dataUrl.split(',')
    const mime = header.match(/:(.*?);/)[1]
    const binary = atob(b64)
    const arr = new Uint8Array(binary.length)
    for (let i = 0; i < binary.length; i++) arr[i] = binary.charCodeAt(i)
    return new File([arr], filename, { type: mime })
  } catch { return null }
}

// ── Per-user localStorage ──
let _localKey = 'gymbro_local_default'
function setLocalKey(uid) { _localKey = uid ? `gymbro_local_${uid}` : 'gymbro_local_default' }
function readLocal() { try { return JSON.parse(localStorage.getItem(_localKey) || '{}') } catch { return {} } }
function writeLocal(patch) {
  const cur = readLocal()
  const next = { ...cur, ...patch }
  localStorage.setItem(_localKey, JSON.stringify(next))
  return next
}

// ── Rank helper ──
const RANKS = [
  {name:"Silver I",min:0,color:"#94A3B8",icon:"🥈"},{name:"Silver II",min:200,color:"#94A3B8",icon:"🥈"},
  {name:"Silver III",min:500,color:"#94A3B8",icon:"🥈"},{name:"Silver IV",min:900,color:"#94A3B8",icon:"🥈"},
  {name:"Silver V",min:1400,color:"#94A3B8",icon:"🥈"},{name:"Gold I",min:2000,color:"#FBBF24",icon:"🥇"},
  {name:"Gold II",min:2800,color:"#FBBF24",icon:"🥇"},{name:"Gold III",min:3700,color:"#FBBF24",icon:"🥇"},
  {name:"Gold IV",min:4700,color:"#FBBF24",icon:"🥇"},{name:"Gold V",min:5800,color:"#FBBF24",icon:"🥇"},
  {name:"Platinum I",min:7000,color:"#67E8F9",icon:"💎"},{name:"Platinum II",min:8500,color:"#67E8F9",icon:"💎"},
  {name:"Platinum III",min:10500,color:"#67E8F9",icon:"💎"},{name:"Platinum IV",min:13000,color:"#67E8F9",icon:"💎"},
  {name:"Platinum V",min:16000,color:"#67E8F9",icon:"💎"},{name:"Diamond I",min:20000,color:"#A78BFA",icon:"🔷"},
  {name:"Diamond II",min:25000,color:"#A78BFA",icon:"🔷"},{name:"Diamond III",min:31000,color:"#A78BFA",icon:"🔷"},
  {name:"Diamond IV",min:38000,color:"#A78BFA",icon:"🔷"},{name:"Diamond V",min:46000,color:"#A78BFA",icon:"🔷"},
  {name:"Emerald I",min:55000,color:"#34D399",icon:"💚"},{name:"Emerald II",min:66000,color:"#34D399",icon:"💚"},
  {name:"Emerald III",min:79000,color:"#34D399",icon:"💚"},{name:"Emerald IV",min:94000,color:"#34D399",icon:"💚"},
  {name:"Emerald V",min:111000,color:"#34D399",icon:"💚"},{name:"Elite I",min:130000,color:"#FF4D4D",icon:"🔥"},
  {name:"Elite II",min:155000,color:"#FF4D4D",icon:"🔥"},{name:"Elite III",min:185000,color:"#FF4D4D",icon:"🔥"},
  {name:"Elite IV",min:220000,color:"#FF4D4D",icon:"🔥"},{name:"Elite V",min:260000,color:"#FF4D4D",icon:"🔥"},
]
function getRankInfo(pts) {
  let r = RANKS[0]
  for (const x of RANKS) { if (pts >= x.min) r = x }
  const tier = r.name.split(' ')[0].toLowerCase()
  return { ...r, tier }
}

const PR_EXERCISES = ['Développé couché','Squat','Soulevé de terre','Développé militaire','Rowing barre','Hip thrust','Presse','Tractions']

export default function App() {
  const [authLoading, setAuthLoading]   = useState(true)
  const [supaSession, setSupaSession]   = useState(null)
  const [profile, setProfile]           = useState(null)
  const [feed, setFeed]                 = useState([])
  const [follows, setFollows]           = useState([])
  const [notifs, setNotifs]             = useState([])
  const [conversations, setConversations] = useState([])
  const [localData, setLocalData]       = useState({})

  // Single source of truth for local data — writes localStorage AND triggers re-render
  const saveLocal = useCallback((patch) => {
    setLocalData(prev => {
      const next = { ...prev, ...patch }
      try { localStorage.setItem(_localKey, JSON.stringify(next)) } catch {}
      return next
    })
  }, [])

  // ── Auth ──
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSupaSession(session)
      if (session) {
        setLocalKey(session.user.id)
        const saved = readLocal()
        setLocalData(saved)
        loadProfile(session.user.id).then(() => setAuthLoading(false))
      } else {
        setAuthLoading(false)
      }
    })
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_e, session) => {
      setSupaSession(session)
      if (session) {
        setLocalKey(session.user.id)
        const saved = readLocal()
        setLocalData(saved)
        loadProfile(session.user.id).catch(() => {})
      } else {
        setLocalKey(null)
        setLocalData({})
        setProfile(null)
      }
    })
    return () => subscription.unsubscribe()
  }, [])

  const loadProfile = useCallback(async (userId) => {
    const { data } = await supabase.from('profiles').select('*').eq('id', userId).single()
    if (data) setProfile(data)
    return data
  }, [])

  // ── Feed — loads posts + comments + like counts ──
  const loadFeed = useCallback(async () => {
    const { data: posts } = await supabase
      .from('posts')
      .select('*, profiles!user_id(pseudo, avatar_url, points, pinned_trophies, trophy_dates, sexe)')
      .order('created_at', { ascending: false })
      .limit(60)
    if (!posts) return

    const uid = supaSession?.user?.id
    const postIds = posts.map(p => p.id)

    const [myLikesRes, allLikesRes, allCommentsRes] = await Promise.all([
      uid ? supabase.from('likes').select('post_id').eq('user_id', uid) : Promise.resolve({ data: [] }),
      postIds.length ? supabase.from('likes').select('post_id') : Promise.resolve({ data: [] }),
      postIds.length ? supabase.from('comments').select('*').in('post_id', postIds).order('created_at') : Promise.resolve({ data: [] }),
    ])

    const likedSet = new Set((myLikesRes.data || []).map(l => l.post_id))
    const likesCount = {}
    for (const l of (allLikesRes.data || [])) {
      likesCount[l.post_id] = (likesCount[l.post_id] || 0) + 1
    }
    const commentsByPost = {}
    for (const cm of (allCommentsRes.data || [])) {
      if (!commentsByPost[cm.post_id]) commentsByPost[cm.post_id] = []
      commentsByPost[cm.post_id].push({ id: cm.id, pseudo: cm.pseudo || '?', avatarVal: '', avatarFallback: '👤', text: cm.text, ts: new Date(cm.created_at).getTime() })
    }

    setFeed(posts.map(p => ({
      id: p.id,
      userId: p.user_id,
      pseudo: p.pseudo || p.profiles?.pseudo || '?',
      avatarVal: p.profiles?.avatar_url || '',
      avatarFallback: p.profiles?.sexe === 'femme' ? '👩' : '👨',
      rankName: p.rank_name, rankColor: p.rank_color, rankIcon: p.rank_icon,
      rankTier: (p.rank_name || 'Silver I').split(' ')[0].toLowerCase(),
      points: p.points || 0,
      caption: p.caption || '', tags: p.tags || [],
      mediaUrl: p.media_url || '', isVideo: p.is_video || false,
      ts: new Date(p.created_at).getTime(),
      likes: Array(likesCount[p.id] || 0).fill('x'),
      commentsList: commentsByPost[p.id] || [],
      liked: likedSet.has(p.id),
      _profilePinnedTrophies: p.profiles?.pinned_trophies || [],
      _profileTrophyDates: p.profiles?.trophy_dates || {},
    })))
  }, [supaSession])

  const loadFollows = useCallback(async () => {
    if (!supaSession?.user?.id) return
    const { data } = await supabase.from('follows').select('following_id').eq('follower_id', supaSession.user.id)
    setFollows((data || []).map(f => f.following_id))
  }, [supaSession])

  const loadNotifs = useCallback(async () => {
    if (!supaSession?.user?.id) return
    const { data } = await supabase
      .from('notifications')
      .select('*, from:from_id(pseudo)')
      .eq('user_id', supaSession.user.id)
      .order('created_at', { ascending: false })
      .limit(30)
    if (data) setNotifs(data.map(n => ({
      id: n.id,
      icon: n.type === 'like' ? '❤️' : n.type === 'comment' ? '💬' : '👥',
      text: n.type === 'like' ? `@${n.from?.pseudo} a liké ton post`
          : n.type === 'comment' ? `@${n.from?.pseudo} a commenté ton post`
          : `@${n.from?.pseudo} te suit`,
      ts: new Date(n.created_at).getTime(), read: n.read,
    })))
  }, [supaSession])

  const loadConversations = useCallback(async () => {
    if (!supaSession?.user?.id) return
    const uid = supaSession.user.id
    const { data } = await supabase
      .from('messages')
      .select('*, from:from_id(pseudo, avatar_url), to:to_id(pseudo, avatar_url)')
      .or(`from_id.eq.${uid},to_id.eq.${uid}`)
      .order('created_at', { ascending: false })
    if (!data) return
    const convMap = {}
    data.forEach(m => {
      const otherId = m.from_id === uid ? m.to_id : m.from_id
      const otherP = m.from_id === uid ? m.to : m.from
      if (!convMap[otherId]) {
        convMap[otherId] = { id: otherId, withId: otherId, withPseudo: otherP?.pseudo || '?', avatarVal: otherP?.avatar_url || '', avatarFallback: '👤', messages: [] }
      }
      convMap[otherId].messages.push({ id: m.id, from: m.from_id === uid ? 'me' : 'other', text: m.text, ts: new Date(m.created_at).getTime() })
    })
    Object.values(convMap).forEach(conv => conv.messages.sort((a, b) => a.ts - b.ts))
    setConversations(Object.values(convMap))
  }, [supaSession])

  useEffect(() => {
    if (supaSession) { loadFeed(); loadFollows(); loadNotifs(); loadConversations() }
  }, [supaSession, loadFeed, loadFollows, loadNotifs, loadConversations])

  // ── Realtime + polling ──
  useEffect(() => {
    if (!supaSession) return
    const uid = supaSession.user.id
    const ch = supabase.channel('gymbro-rt')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'posts' }, () => loadFeed())
      .on('postgres_changes', { event: '*', schema: 'public', table: 'likes' }, () => loadFeed())
      .on('postgres_changes', { event: '*', schema: 'public', table: 'comments' }, () => loadFeed())
      .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'profiles' }, () => loadProfile(uid))
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'notifications', filter: `user_id=eq.${uid}` }, () => loadNotifs())
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'messages', filter: `to_id=eq.${uid}` }, () => loadConversations())
      .subscribe()
    const poll = setInterval(() => { loadFeed(); loadProfile(uid); loadNotifs() }, 25000)
    return () => { supabase.removeChannel(ch); clearInterval(poll) }
  }, [supaSession, loadFeed, loadProfile, loadNotifs, loadConversations])

  // ══════════════════════ AUTH ══
  async function signUp({ email, pseudo, password, sexe, age, poids, taille, country }) {
    const { data, error } = await supabase.auth.signUp({ email, password })
    if (error) throw error
    const uid = data.user.id
    await new Promise(r => setTimeout(r, 600))
    await supabase.from('profiles').upsert({ id: uid, email, pseudo, sexe, age: +age||0, poids: +poids||0, taille: +taille||0, country: country||'France', points: 0, sessions: 0, prs: 0 })
    setLocalKey(uid); setLocalData({})
    await loadProfile(uid); await loadFeed(); await loadFollows()
    return data
  }

  async function signIn({ email, password }) {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) throw error
    if (data.user) {
      setLocalKey(data.user.id)
      setLocalData(readLocal())
      await loadProfile(data.user.id); await loadFeed(); await loadFollows()
    }
    return data
  }

  async function signOut() { await supabase.auth.signOut() }

  // ══════════════════════ SOCIAL ══
  async function addPost({ caption, tags, mediaUrl, isVideo }) {
    if (!supaSession || !profile) return
    let finalUrl = ''
    if (mediaUrl?.startsWith('data:')) {
      try {
        const file = dataURLtoFile(mediaUrl, isVideo ? 'post.mp4' : 'post.jpg')
        if (file) { const url = await uploadMedia(file, supaSession.user.id); if (url) finalUrl = url }
      } catch(e) { console.warn('Upload failed:', e) }
    }
    const rank = getRankInfo(profile.points || 0)
    const { error } = await supabase.from('posts').insert({
      user_id: supaSession.user.id, pseudo: profile.pseudo,
      caption: caption || '', tags: tags || [],
      media_url: finalUrl, is_video: isVideo || false,
      rank_name: rank.name, rank_color: rank.color, rank_icon: rank.icon,
      points: profile.points || 0,
    })
    if (error) { console.error('addPost error:', error.message); throw new Error(error.message) }
    await loadFeed()
  }

  async function toggleLike(postId) {
    if (!supaSession) return
    const uid = supaSession.user.id
    const post = feed.find(p => p.id === postId)
    if (!post) return
    const nowLiked = !post.liked
    setFeed(f => f.map(p => p.id !== postId ? p : {
      ...p, liked: nowLiked,
      likes: Array(Math.max(0, nowLiked ? (p.likes.length||0)+1 : (p.likes.length||1)-1)).fill('x')
    }))
    try {
      if (post.liked) {
        await supabase.from('likes').delete().eq('post_id', postId).eq('user_id', uid)
      } else {
        await supabase.from('likes').insert({ post_id: postId, user_id: uid })
        if (post.userId !== uid) supabase.from('notifications').insert({ user_id: post.userId, from_id: uid, type: 'like', post_id: postId }).catch(() => {})
      }
    } catch(e) {
      console.error('toggleLike:', e)
      setFeed(f => f.map(p => p.id !== postId ? p : { ...p, liked: post.liked, likes: post.likes }))
    }
    loadFeed()
  }

  async function addComment(postId, text) {
    if (!supaSession || !profile) return
    await supabase.from('comments').insert({ post_id: postId, user_id: supaSession.user.id, pseudo: profile.pseudo, text })
    const post = feed.find(p => p.id === postId)
    if (post && post.userId !== supaSession.user.id) {
      supabase.from('notifications').insert({ user_id: post.userId, from_id: supaSession.user.id, type: 'comment', post_id: postId }).catch(() => {})
    }
    loadFeed()
  }

  async function toggleFollow(userId) {
    if (!supaSession || userId === supaSession.user.id) return
    const uid = supaSession.user.id
    const isFollowing = follows.includes(userId)
    setFollows(f => isFollowing ? f.filter(id => id !== userId) : [...f, userId])
    try {
      if (isFollowing) {
        await supabase.from('follows').delete().eq('follower_id', uid).eq('following_id', userId)
      } else {
        await supabase.from('follows').insert({ follower_id: uid, following_id: userId })
        supabase.from('notifications').insert({ user_id: userId, from_id: uid, type: 'follow' }).catch(() => {})
      }
    } catch(e) {
      console.error('toggleFollow:', e)
      setFollows(f => isFollowing ? [...f, userId] : f.filter(id => id !== userId))
    }
    loadFollows()
  }

  async function sendMessage(toId, _tp, _av, _fb, text) {
    if (!supaSession || !toId || toId === supaSession.user.id || !text?.trim()) return
    await supabase.from('messages').insert({ from_id: supaSession.user.id, to_id: toId, text })
    loadConversations()
  }

  async function updateProfile(updates) {
    if (!supaSession) return
    const db = {}
    if (updates.pseudo   !== undefined) db.pseudo     = updates.pseudo
    if (updates.bio      !== undefined) db.bio        = updates.bio
    if (updates.poids    !== undefined) db.poids      = +updates.poids || 0
    if (updates.taille   !== undefined) db.taille     = +updates.taille || 0
    if (updates.pinnedTrophies) db.pinned_trophies = updates.pinnedTrophies
    if (updates.trophyDates)    db.trophy_dates    = updates.trophyDates
    if (updates.avatar?.startsWith('data:')) {
      const file = dataURLtoFile(updates.avatar, 'avatar.jpg')
      if (file) { const url = await uploadMedia(file, supaSession.user.id); if (url) db.avatar_url = url }
    } else if (updates.avatar) {
      db.avatar_url = updates.avatar
    }
    if (Object.keys(db).length) {
      const { error } = await supabase.from('profiles').update(db).eq('id', supaSession.user.id)
      if (error) throw error
    }
    await loadProfile(supaSession.user.id)
    loadFeed()
  }

  // ══════════════════════ SAVE SESSION — OFFLINE FIRST ══
  // Saves locally FIRST (instant UI update), then syncs to Supabase in background
  const saveSession = useCallback(async (dayName, programName, result, durationSec, onLocalUpdate) => {
    const now = Date.now()
    const hour = new Date(now).getHours()
    const dow  = new Date(now).getDay()
    const isEarly   = hour < 7
    const isNight   = hour >= 22
    const isWeekend = dow === 0 || dow === 6
    const today     = new Date().toDateString()

    // ── 1. Update localStorage + React state IMMEDIATELY ──
    const cur = readLocal()
    const newExercises = { ...(cur.exercises || {}) }
    let prCount = 0
    result.forEach(ex => {
      if (!ex.sets?.length) return
      if (!newExercises[ex.name]) newExercises[ex.name] = []
      newExercises[ex.name].push({ date: now, sets: ex.sets })
      if (PR_EXERCISES.includes(ex.name)) {
        const prev    = newExercises[ex.name].slice(0, -1)
        const prevMax = prev.flatMap(h => h.sets.map(s => s.weight || 0)).reduce((a, b) => Math.max(a, b), -1)
        const curMax  = ex.sets.map(s => s.weight || 0).reduce((a, b) => Math.max(a, b), -1)
        if (curMax > prevMax && prevMax >= 0) prCount++
      }
    })
    const newEntry = { id: Math.random().toString(36).slice(2), date: now, dayName, programName, durationSec, exercises: result }
    const newHistory = [newEntry, ...(cur.sessionHistory || [])]
    const patch = { exercises: newExercises, sessionHistory: newHistory }

    // This triggers React re-render immediately
    saveLocal(patch)
    if (onLocalUpdate) onLocalUpdate(patch)

    // ── 2. Sync to Supabase in background (non-blocking) ──
    if (supaSession && profile) {
      const isNewDay  = (profile.last_session_date || '') !== today
      const xpGain    = (isNewDay ? 50 : 0) + (isEarly && isNewDay ? 75 : 0) + prCount * 150
      const statUp = {
        sessions: (profile.sessions || 0) + (isNewDay ? 1 : 0),
        prs:      (profile.prs || 0) + prCount,
        points:   (profile.points || 0) + xpGain,
        early_session:    profile.early_session || isEarly,
        night_session:    profile.night_session || isNight,
        weekend_sessions: (profile.weekend_sessions || 0) + (isWeekend && isNewDay ? 1 : 0),
        last_session_date: today,
      }

      // Fire and forget — don't await
      supabase.from('session_history').insert({ user_id: supaSession.user.id, day_name: dayName, program_name: programName, duration_sec: durationSec, exercises: result })
        .then(({ error }) => { if (error) console.warn('session_history:', error.message) })

      supabase.from('profiles').update(statUp).eq('id', supaSession.user.id)
        .then(({ error }) => {
          if (error) { console.warn('stats update:', error.message) }
          else { loadProfile(supaSession.user.id) }
        })
    }

    return { isNewDay: (profile?.last_session_date || '') !== today, isEarly, prCount }
  }, [supaSession, profile, saveLocal, loadProfile])

  // ══════════════════════ BUILD STATE ══
  if (authLoading) return <Loader />

  if (!supaSession) {
    return <GymbroOffline
      supabaseMode={true}
      externalSaveLocal={saveLocal}
      supabaseCallbacks={{ onSignUp: signUp, onSignIn: signIn, onLogout: signOut, addPost, toggleLike, addComment, toggleFollow, sendMessage, updateProfile, saveSession,
        updatePrograms: (p) => saveLocal({ programs: p }),
        updatePinnedTrophies: async (ids) => { if (!supaSession) return; await supabase.from('profiles').update({ pinned_trophies: ids }).eq('id', supaSession.user.id); await loadProfile(supaSession.user.id) },
        updateTrophyDate: async (id) => { if (!supaSession || !profile) return; const dates = { ...(profile.trophy_dates||{}), [id]: Date.now() }; await supabase.from('profiles').update({ trophy_dates: dates }).eq('id', supaSession.user.id); await loadProfile(supaSession.user.id) },
        updateCountry: async (c) => { if (!supaSession) return; await supabase.from('profiles').update({ country: c }).eq('id', supaSession.user.id); await loadProfile(supaSession.user.id) },
      }}
      externalAppState={null}
      isAuthenticated={false}
    />
  }

  const uiUser = profile ? {
    email: profile.email||'', pseudo: profile.pseudo||'', password: '',
    sexe: profile.sexe||'homme', age: profile.age||0, poids: profile.poids||0,
    taille: profile.taille||0, bio: profile.bio||'', avatar: profile.avatar_url||'',
    pinnedTrophies: profile.pinned_trophies||[], trophyDates: profile.trophy_dates||{},
    createdAt: new Date(profile.created_at||Date.now()).getTime(),
  } : null

  const uiStats = profile ? {
    sessions: profile.sessions||0, prs: profile.prs||0, points: profile.points||0,
    streak: profile.streak||0, totalLikes: profile.total_likes||0,
    followers: profile.followers_count||0, following: profile.following_count||0,
    posts: profile.posts_count||0, earlySession: profile.early_session||false,
    nightSession: profile.night_session||false, weekendSessions: profile.weekend_sessions||0,
    commentsSent: profile.comments_sent||0, changedCountry: false,
  } : null

  const appState = {
    user: uiUser, stats: uiStats, posts: feed,
    programs:       localData.programs       || [],
    exercises:      localData.exercises      || {},
    sessionHistory: localData.sessionHistory || [],
    country:  profile?.country || 'France',
    following: follows, conversations, notifs,
  }

  return <GymbroOffline
    supabaseMode={true}
    externalSaveLocal={saveLocal}
    supabaseCallbacks={{
      onSignUp: signUp, onSignIn: signIn, onLogout: signOut,
      addPost, toggleLike, addComment, toggleFollow, sendMessage,
      updateProfile, saveSession,
      updatePrograms: (p) => saveLocal({ programs: p }),
      updatePinnedTrophies: async (ids) => { await supabase.from('profiles').update({ pinned_trophies: ids }).eq('id', supaSession.user.id); await loadProfile(supaSession.user.id) },
      updateTrophyDate: async (id) => { const dates = { ...(profile?.trophy_dates||{}), [id]: Date.now() }; await supabase.from('profiles').update({ trophy_dates: dates }).eq('id', supaSession.user.id); await loadProfile(supaSession.user.id) },
      updateCountry: async (c) => { await supabase.from('profiles').update({ country: c }).eq('id', supaSession.user.id); await loadProfile(supaSession.user.id) },
    }}
    externalAppState={appState}
    isAuthenticated={true}
  />
}
