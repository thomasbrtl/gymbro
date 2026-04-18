// ══════════════════════════════════════════════════════════════════
//  GYMBRO — App.jsx  (Supabase integration layer)
// ══════════════════════════════════════════════════════════════════
import { useState, useEffect, useCallback } from 'react'
import { supabase } from './supabase.js'
import GymbroOffline from './gymbro.jsx'

function Loader() {
  return (
    <div style={{ minHeight:'100vh', background:'#0A0A0F', display:'flex', alignItems:'center', justifyContent:'center', flexDirection:'column', gap:16 }}>
      <div style={{ fontSize:52 }}>🏋️</div>
      <div style={{ color:'#FF3D3D', fontSize:24, fontWeight:900, fontFamily:"'Barlow Condensed',sans-serif" }}>
        GYM<span style={{color:'#F0F0F0'}}>BRO</span>
      </div>
      <div style={{ width:36, height:36, border:'3px solid #FF3D3D33', borderTopColor:'#FF3D3D', borderRadius:'50%', animation:'spin .8s linear infinite' }}/>
      <style>{`@keyframes spin{to{transform:rotate(360deg)}} *{box-sizing:border-box}`}</style>
    </div>
  )
}

// ── Upload a File to Supabase Storage ──
async function uploadMedia(file, userId) {
  if (!file) return null
  try {
    const ext = file.name.split('.').pop() || 'jpg'
    const path = `${userId}/${Date.now()}.${ext}`
    const { error } = await supabase.storage.from('gymbro-media').upload(path, file)
    if (error) { console.warn('Storage upload failed:', error.message); return null }
    const { data } = supabase.storage.from('gymbro-media').getPublicUrl(path)
    return data.publicUrl
  } catch (e) { console.warn('uploadMedia error:', e); return null }
}

function dataURLtoFile(dataUrl, filename) {
  if (!dataUrl || !dataUrl.startsWith('data:')) return null
  try {
    const arr = dataUrl.split(',')
    const mime = arr[0].match(/:(.*?);/)[1]
    const bstr = atob(arr[1])
    let n = bstr.length
    const u8 = new Uint8Array(n)
    while (n--) u8[n] = bstr.charCodeAt(n)
    return new File([u8], filename, { type: mime })
  } catch { return null }
}

// ── Local cache helpers ──
// Key is per-user so different accounts don't share programs/exercises
let _localKey = 'gymbro_local_default'
function setLocalKey(userId) { _localKey = userId ? `gymbro_local_${userId}` : 'gymbro_local_default' }
function readLocal() { try { return JSON.parse(localStorage.getItem(_localKey) || '{}') } catch { return {} } }
function writeLocal(patch) {
  const next = { ...readLocal(), ...patch }
  localStorage.setItem(_localKey, JSON.stringify(next))
  return next
}

// ── Rank helper (duplicated from gymbro.jsx to avoid cross-import) ──
const RANK_TIERS = [
  {name:"Silver I",min:0,tier:"silver",color:"#94A3B8",icon:"🥈"},
  {name:"Silver II",min:200,tier:"silver",color:"#94A3B8",icon:"🥈"},
  {name:"Silver III",min:500,tier:"silver",color:"#94A3B8",icon:"🥈"},
  {name:"Silver IV",min:900,tier:"silver",color:"#94A3B8",icon:"🥈"},
  {name:"Silver V",min:1400,tier:"silver",color:"#94A3B8",icon:"🥈"},
  {name:"Gold I",min:2000,tier:"gold",color:"#FBBF24",icon:"🥇"},
  {name:"Gold II",min:2800,tier:"gold",color:"#FBBF24",icon:"🥇"},
  {name:"Gold III",min:3700,tier:"gold",color:"#FBBF24",icon:"🥇"},
  {name:"Gold IV",min:4700,tier:"gold",color:"#FBBF24",icon:"🥇"},
  {name:"Gold V",min:5800,tier:"gold",color:"#FBBF24",icon:"🥇"},
  {name:"Platinum I",min:7000,tier:"platinum",color:"#67E8F9",icon:"💎"},
  {name:"Platinum II",min:8500,tier:"platinum",color:"#67E8F9",icon:"💎"},
  {name:"Platinum III",min:10500,tier:"platinum",color:"#67E8F9",icon:"💎"},
  {name:"Platinum IV",min:13000,tier:"platinum",color:"#67E8F9",icon:"💎"},
  {name:"Platinum V",min:16000,tier:"platinum",color:"#67E8F9",icon:"💎"},
  {name:"Diamond I",min:20000,tier:"diamond",color:"#A78BFA",icon:"🔷"},
  {name:"Diamond II",min:25000,tier:"diamond",color:"#A78BFA",icon:"🔷"},
  {name:"Diamond III",min:31000,tier:"diamond",color:"#A78BFA",icon:"🔷"},
  {name:"Diamond IV",min:38000,tier:"diamond",color:"#A78BFA",icon:"🔷"},
  {name:"Diamond V",min:46000,tier:"diamond",color:"#A78BFA",icon:"🔷"},
  {name:"Emerald I",min:55000,tier:"emerald",color:"#34D399",icon:"💚"},
  {name:"Emerald II",min:66000,tier:"emerald",color:"#34D399",icon:"💚"},
  {name:"Emerald III",min:79000,tier:"emerald",color:"#34D399",icon:"💚"},
  {name:"Emerald IV",min:94000,tier:"emerald",color:"#34D399",icon:"💚"},
  {name:"Emerald V",min:111000,tier:"emerald",color:"#34D399",icon:"💚"},
  {name:"Elite I",min:130000,tier:"elite",color:"#FF4D4D",icon:"🔥"},
  {name:"Elite II",min:155000,tier:"elite",color:"#FF4D4D",icon:"🔥"},
  {name:"Elite III",min:185000,tier:"elite",color:"#FF4D4D",icon:"🔥"},
  {name:"Elite IV",min:220000,tier:"elite",color:"#FF4D4D",icon:"🔥"},
  {name:"Elite V",min:260000,tier:"elite",color:"#FF4D4D",icon:"🔥"},
]
function getRankInfo(pts) {
  let r = RANK_TIERS[0]
  for (const x of RANK_TIERS) { if (pts >= x.min) r = x }
  return r
}

const PR_EXERCISES = ['Développé couché','Squat','Soulevé de terre','Développé militaire','Rowing barre','Hip thrust','Presse','Tractions']

export default function App() {
  const [authLoading, setAuthLoading] = useState(true)
  const [supaSession, setSupaSession] = useState(null)
  const [profile, setProfile] = useState(null)
  const [feed, setFeed] = useState([])
  const [follows, setFollows] = useState([])
  const [notifs, setNotifs] = useState([])
  const [conversations, setConversations] = useState([])
  const [localData, setLocalData] = useState({})  // Loaded after user ID is known

  // Force re-render with new local data
  const saveLocal = useCallback((patch) => {
    const next = writeLocal(patch)
    setLocalData(next)
  }, [])

  // ── Auth ──
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSupaSession(session)
      if (session) {
        setLocalKey(session.user.id)  // Switch to this user's local storage
        loadProfile(session.user.id).then(() => setAuthLoading(false))
      } else setAuthLoading(false)
    })
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_e, session) => {
      setSupaSession(session)
      if (session) {
        setLocalKey(session.user.id)
        loadProfile(session.user.id).catch(()=>{})
      } else {
        setLocalKey(null)
        setProfile(null)
        setLocalData({})  // Clear local data when logged out
      }
    })
    return () => subscription.unsubscribe()
  }, [])

  // ── Load profile ──
  const loadProfile = useCallback(async (userId) => {
    const { data } = await supabase.from('profiles').select('*').eq('id', userId).single()
    if (data) {
      setProfile(data)
      setLocalKey(userId)  // Ensure key is set
      setLocalData(readLocal())  // Load this user's local data
    }
    return data
  }, [])

  // ── Load feed (includes comments) ──
  const loadFeed = useCallback(async () => {
    const { data: posts } = await supabase
      .from('posts')
      .select('*, profiles!user_id(pseudo, avatar_url, points, pinned_trophies, trophy_dates, sexe)')
      .order('created_at', { ascending: false })
      .limit(60)
    if (!posts) return

    const uid = supaSession?.user?.id
    const postIds = posts.map(p => p.id)

    // Load likes for current user + actual like counts per post
    const [myLikesRes, allLikesRes, allCommentsRes] = await Promise.all([
      uid ? supabase.from('likes').select('post_id').eq('user_id', uid) : Promise.resolve({ data: [] }),
      postIds.length ? supabase.from('likes').select('post_id') : Promise.resolve({ data: [] }),
      postIds.length ? supabase.from('comments').select('*').in('post_id', postIds).order('created_at') : Promise.resolve({ data: [] }),
    ])

    const likedSet = new Set((myLikesRes.data || []).map(l => l.post_id))

    // Count likes per post from the likes table (accurate)
    const likesCount = {}
    for (const l of (allLikesRes.data || [])) {
      likesCount[l.post_id] = (likesCount[l.post_id] || 0) + 1
    }

    const allComments = allCommentsRes
    const commentsByPost = {}
    for (const cm of (allComments || [])) {
      if (!commentsByPost[cm.post_id]) commentsByPost[cm.post_id] = []
      commentsByPost[cm.post_id].push({
        id: cm.id, pseudo: cm.pseudo || '?',
        avatarVal: '', avatarFallback: '👤',
        text: cm.text, ts: new Date(cm.created_at).getTime()
      })
    }

    const mapped = posts.map(p => ({
      id: p.id,
      userId: p.user_id,
      pseudo: p.pseudo || p.profiles?.pseudo || '?',
      avatarVal: p.profiles?.avatar_url || '',
      avatarFallback: p.profiles?.sexe === 'femme' ? '👩' : '👨',
      rankName: p.rank_name,
      rankColor: p.rank_color,
      rankIcon: p.rank_icon,
      rankTier: (p.rank_name || 'Silver I').split(' ')[0].toLowerCase(),
      points: p.points || 0,
      caption: p.caption || '',
      tags: p.tags || [],
      mediaUrl: p.media_url || '',
      isVideo: p.is_video || false,
      imgPos: p.img_pos || 'center',
      ts: new Date(p.created_at).getTime(),
      likes: Array(likesCount[p.id] || 0).fill('x'),
      commentsList: commentsByPost[p.id] || [],
      liked: likedSet.has(p.id),
      // Pass profile data for viewing
      _profileAvatarUrl: p.profiles?.avatar_url || '',
      _profilePinnedTrophies: p.profiles?.pinned_trophies || [],
      _profileTrophyDates: p.profiles?.trophy_dates || {},
    }))
    setFeed(mapped)
  }, [supaSession])

  // ── Load follows ──
  const loadFollows = useCallback(async () => {
    if (!supaSession?.user?.id) return
    const { data } = await supabase.from('follows').select('following_id').eq('follower_id', supaSession.user.id)
    setFollows((data || []).map(f => f.following_id))
  }, [supaSession])

  // ── Load notifs ──
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
      ts: new Date(n.created_at).getTime(),
      read: n.read,
    })))
  }, [supaSession])

  // ── Load conversations ──
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
    Object.values(convMap).forEach(conv => conv.messages.sort((a,b) => a.ts - b.ts))
    setConversations(Object.values(convMap))
  }, [supaSession])

  // ── Initial load ──
  useEffect(() => {
    if (supaSession) { loadFeed(); loadFollows(); loadNotifs(); loadConversations() }
  }, [supaSession, loadFeed, loadFollows, loadNotifs, loadConversations])

  // ── Real-time + polling ──
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
    // Small delay to ensure auth is ready
    await new Promise(r => setTimeout(r, 500))
    await supabase.from('profiles').upsert({
      id: uid, email, pseudo, sexe,
      age: +age || 0, poids: +poids || 0, taille: +taille || 0,
      country: country || 'France',
      points: 0, sessions: 0, prs: 0,
    })
    // Explicitly load profile so UI doesn't stay blank
    setLocalKey(uid)
    setLocalData({})
    await loadProfile(uid)
    await loadFeed()
    return data
  }
  async function signIn({ email, password }) {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) throw error
    // Explicitly load profile so UI transitions immediately
    if (data.user) {
      setLocalKey(data.user.id)
      await loadProfile(data.user.id)
      await loadFeed()
      await loadFollows()
    }
    return data
  }
  async function signOut() { await supabase.auth.signOut() }

  // ══════════════════════ SOCIAL ══
  async function addPost({ caption, tags, mediaUrl, isVideo }) {
    if (!supaSession || !profile) return
    // Upload media si disponible
    let finalUrl = ''
    if (mediaUrl?.startsWith('data:')) {
      try {
        const ext = isVideo ? 'mp4' : 'jpg'
        const file = dataURLtoFile(mediaUrl, `post.${ext}`)
        if (file) {
          const up = await uploadMedia(file, supaSession.user.id)
          if (up) finalUrl = up
        }
      } catch(e) { console.warn('Upload échoué, post sans media:', e) }
    }
    const rank = getRankInfo(profile.points || 0)
    const { error } = await supabase.from('posts').insert({
      user_id: supaSession.user.id,
      pseudo: profile.pseudo,
      caption: caption || '',
      tags: tags || [],
      media_url: finalUrl,
      is_video: isVideo || false,
      rank_name: rank.name,
      rank_color: rank.color,
      rank_icon: rank.icon,
      points: profile.points || 0,
    })
    if (error) {
      console.error('Erreur insert post:', error.message)
      throw new Error(error.message)
    }
    await supabase.from('profiles')
      .update({ posts_count: (profile.posts_count || 0) + 1 })
      .eq('id', supaSession.user.id)
    await loadFeed()
  }

  async function toggleLike(postId) {
    if (!supaSession) return
    const uid = supaSession.user.id
    const post = feed.find(p => p.id === postId)
    if (!post) return
    const nowLiked = !post.liked
    // Optimistic update immediately
    setFeed(f => f.map(p => p.id !== postId ? p : {
      ...p, liked: nowLiked,
      likes: Array(Math.max(0, nowLiked ? (p.likes.length||0)+1 : (p.likes.length||1)-1)).fill('x')
    }))
    try {
      if (post.liked) {
        await supabase.from('likes').delete().eq('post_id', postId).eq('user_id', uid)
      } else {
        await supabase.from('likes').insert({ post_id: postId, user_id: uid })
        if (post.userId !== uid) {
          await supabase.from('notifications').insert({ user_id: post.userId, from_id: uid, type: 'like', post_id: postId }).catch(()=>{})
        }
      }
    } catch(e) {
      console.error('toggleLike error:', e)
      // Revert optimistic update on error
      setFeed(f => f.map(p => p.id !== postId ? p : { ...p, liked: post.liked, likes: post.likes }))
    }
    // Reload for accurate counts (especially for other users)
    await loadFeed()
  }

  async function addComment(postId, text) {
    if (!supaSession || !profile) return
    await supabase.from('comments').insert({ post_id: postId, user_id: supaSession.user.id, pseudo: profile.pseudo, text })
    const post = feed.find(p => p.id === postId)
    if (post && post.userId !== supaSession.user.id) {
      await supabase.from('notifications').insert({ user_id: post.userId, from_id: supaSession.user.id, type: 'comment', post_id: postId }).catch(()=>{})
    }
    await loadFeed()
  }

  async function toggleFollow(userId) {
    if (!supaSession || userId === supaSession.user.id) return
    const uid = supaSession.user.id
    const isFollowing = follows.includes(userId)
    // Optimistic update — button changes immediately
    setFollows(f => isFollowing ? f.filter(id => id !== userId) : [...f, userId])
    try {
      if (isFollowing) {
        await supabase.from('follows').delete().eq('follower_id', uid).eq('following_id', userId)
      } else {
        await supabase.from('follows').insert({ follower_id: uid, following_id: userId })
        await supabase.from('notifications').insert({ user_id: userId, from_id: uid, type: 'follow' }).catch(()=>{})
      }
    } catch(e) { console.error('toggleFollow error:', e) }
    // Confirm from DB
    await loadFollows()
  }

  async function sendMessage(toId, _toPseudo, _av, _fb, text) {
    if (!supaSession || !toId || toId === supaSession.user.id || !text?.trim()) return
    await supabase.from('messages').insert({ from_id: supaSession.user.id, to_id: toId, text })
    await loadConversations()
  }

  async function updateProfile(updates) {
    if (!supaSession) return
    const db = {}
    if (updates.pseudo   !== undefined) db.pseudo    = updates.pseudo
    if (updates.bio      !== undefined) db.bio       = updates.bio
    if (updates.poids    !== undefined) db.poids     = +updates.poids || 0
    if (updates.taille   !== undefined) db.taille    = +updates.taille || 0
    if (updates.pinnedTrophies)         db.pinned_trophies = updates.pinnedTrophies
    if (updates.trophyDates)            db.trophy_dates    = updates.trophyDates
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
    await loadFeed()
  }

  async function updateStats(statUpdates) {
    if (!supaSession) return
    await supabase.from('profiles').update(statUpdates).eq('id', supaSession.user.id)
    await loadProfile(supaSession.user.id)
  }

  // ── saveSession ──
  const saveSession = async (dayName, programName, result, durationSec, onLocalUpdate) => {
    if (!supaSession || !profile) return
    const now = Date.now()
    const hour = new Date(now).getHours()
    const dow = new Date(now).getDay()
    const isEarly = hour < 7, isNight = hour >= 22, isWeekend = dow === 0 || dow === 6
    const today = new Date().toDateString()
    const isNewDay = (profile.last_session_date || '') !== today

    // Save to Supabase (non-blocking — local data updates regardless)
    supabase.from('session_history').insert({
      user_id: supaSession.user.id, day_name: dayName,
      program_name: programName, duration_sec: durationSec, exercises: result
    }).then(({error})=>{ if(error) console.warn('session_history insert:', error.message) })
    for (const ex of result) {
      if (ex.sets?.length) {
        supabase.from('exercise_records').insert({
          user_id: supaSession.user.id, name: ex.name, sets: ex.sets
        }).catch(()=>{})
      }
    }

    // Update local cache
    const cur = readLocal()
    const newExercises = { ...(cur.exercises || {}) }
    let prCount = 0
    result.forEach(ex => {
      if (!ex.sets?.length) return
      if (!newExercises[ex.name]) newExercises[ex.name] = []
      newExercises[ex.name].push({ date: now, sets: ex.sets })
      if (PR_EXERCISES.includes(ex.name)) {
        const prev = newExercises[ex.name].slice(0, -1)
        const prevMax = prev.flatMap(h => h.sets.map(s => s.weight || 0)).reduce((a,b) => Math.max(a,b), -1)
        const curMax  = ex.sets.map(s => s.weight || 0).reduce((a,b) => Math.max(a,b), -1)
        if (curMax > prevMax && prevMax >= 0) prCount++
      }
    })
    const newHistory = [{ id: Math.random().toString(36).slice(2), date: now, dayName, programName, durationSec, exercises: result }, ...(cur.sessionHistory || [])]
    const patch = { exercises: newExercises, sessionHistory: newHistory }
    saveLocal(patch)
    if (onLocalUpdate) onLocalUpdate(patch)

    // XP + stats
    const xpGain = (isNewDay ? 50 : 0) + (isEarly && isNewDay ? 75 : 0) + prCount * 150
    const statUp = {
      sessions: (profile.sessions || 0) + (isNewDay ? 1 : 0),
      prs: (profile.prs || 0) + prCount,
      points: (profile.points || 0) + xpGain,
      early_session: profile.early_session || isEarly,
      night_session: profile.night_session || isNight,
      weekend_sessions: (profile.weekend_sessions || 0) + (isWeekend && isNewDay ? 1 : 0),
      last_session_date: today,
    }
    await updateStats(statUp)
    return { isNewDay, isEarly, prCount }
  }

  if (authLoading) return <Loader />
  if (!supaSession) {
    // Pass to GymbroOffline in Supabase mode — it will show auth screens
    return <GymbroOffline
      supabaseMode={true}
      supabaseCallbacks={{ onSignUp: signUp, onSignIn: signIn, onLogout: signOut, addPost, toggleLike, addComment, toggleFollow, sendMessage, updateProfile, saveSession, updatePrograms: (p) => saveLocal({ programs: p }), updatePinnedTrophies: async (ids) => { await supabase.from('profiles').update({ pinned_trophies: ids }).eq('id', supaSession?.user?.id || ''); }, updateTrophyDate: async (id) => { const dates = { ...(profile?.trophy_dates || {}), [id]: Date.now() }; await supabase.from('profiles').update({ trophy_dates: dates }).eq('id', supaSession?.user?.id || ''); }, updateCountry: async (c) => { await supabase.from('profiles').update({ country: c }).eq('id', supaSession?.user?.id || ''); await loadProfile(supaSession?.user?.id); } }}
      externalAppState={null}
      isAuthenticated={false}
    />
  }

  const uiUser = profile ? {
    email: profile.email || '', pseudo: profile.pseudo || '', password: '',
    sexe: profile.sexe || 'homme', age: profile.age || 0, poids: profile.poids || 0,
    taille: profile.taille || 0, bio: profile.bio || '', avatar: profile.avatar_url || '',
    pinnedTrophies: profile.pinned_trophies || [], trophyDates: profile.trophy_dates || {},
    createdAt: new Date(profile.created_at).getTime(),
  } : null

  const uiStats = profile ? {
    sessions: profile.sessions || 0, prs: profile.prs || 0, points: profile.points || 0,
    streak: profile.streak || 0, totalLikes: profile.total_likes || 0,
    followers: profile.followers_count || 0, following: profile.following_count || 0,
    posts: profile.posts_count || 0, earlySession: profile.early_session || false,
    nightSession: profile.night_session || false, weekendSessions: profile.weekend_sessions || 0,
    commentsSent: profile.comments_sent || 0, changedCountry: false,
  } : null

  const appState = {
    user: uiUser, stats: uiStats, posts: feed,
    programs: localData.programs || [],
    exercises: localData.exercises || {},
    sessionHistory: localData.sessionHistory || [],
    country: profile?.country || 'France',
    following: follows, conversations, notifs,
  }

  const callbacks = {
    onSignUp: signUp, onSignIn: signIn, onLogout: signOut,
    addPost, toggleLike, addComment, toggleFollow, sendMessage,
    updateProfile,
    saveSession,
    updatePrograms: (p) => saveLocal({ programs: p }),
    updatePinnedTrophies: async (ids) => { await supabase.from('profiles').update({ pinned_trophies: ids }).eq('id', supaSession.user.id); await loadProfile(supaSession.user.id) },
    updateTrophyDate: async (id) => { const dates = { ...(profile?.trophy_dates || {}), [id]: Date.now() }; await supabase.from('profiles').update({ trophy_dates: dates }).eq('id', supaSession.user.id); await loadProfile(supaSession.user.id) },
    updateCountry: async (c) => { await supabase.from('profiles').update({ country: c }).eq('id', supaSession.user.id); await loadProfile(supaSession.user.id) },
  }

  return <GymbroOffline supabaseMode={true} supabaseCallbacks={callbacks} externalAppState={appState} isAuthenticated={true} externalSaveLocal={saveLocal} />
}
