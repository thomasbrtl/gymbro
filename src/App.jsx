// ══════════════════════════════════════════════════════════════════
//  GYMBRO — Supabase Integration Layer
//  Social features (posts, likes, comments, follows, messages,
//  notifications) use Supabase.
//  Personal data (programs, exercises, sessions) stays in localStorage
//  so the app works offline.
// ══════════════════════════════════════════════════════════════════
import { useState, useEffect, useRef, useCallback } from 'react'
import { supabase } from './supabase.js'
import GymbroOffline from './gymbro.jsx'

// ══════════════════════ LOADING SCREEN ══
function Loader() {
  return (
    <div style={{ minHeight:'100vh', background:'#0A0A0F', display:'flex', alignItems:'center', justifyContent:'center', flexDirection:'column', gap:16 }}>
      <div style={{ fontSize:52 }}>🏋️</div>
      <div style={{ color:'#FF3D3D', fontSize:24, fontWeight:900, fontFamily:"'Barlow Condensed',sans-serif", letterSpacing:'-.02em' }}>
        <span>GYM</span><span style={{color:'#F0F0F0'}}>BRO</span>
      </div>
      <div style={{ width:36, height:36, border:'3px solid #FF3D3D33', borderTopColor:'#FF3D3D', borderRadius:'50%', animation:'spin .8s linear infinite' }}/>
      <style>{`@keyframes spin{to{transform:rotate(360deg)}} *{box-sizing:border-box}`}</style>
    </div>
  )
}

// ══════════════════════ SUPABASE HELPERS ══
async function uploadMedia(file, userId) {
  if (!file) return null
  const ext = file.name.split('.').pop()
  const path = `${userId}/${Date.now()}.${ext}`
  const { error } = await supabase.storage.from('gymbro-media').upload(path, file)
  if (error) { console.error('Upload error:', error); return null }
  const { data } = supabase.storage.from('gymbro-media').getPublicUrl(path)
  return data.publicUrl
}

// Convert data URL back to File for upload
function dataURLtoFile(dataUrl, filename) {
  if (!dataUrl || !dataUrl.startsWith('data:')) return null
  const arr = dataUrl.split(',')
  const mime = arr[0].match(/:(.*?);/)[1]
  const bstr = atob(arr[1])
  let n = bstr.length
  const u8arr = new Uint8Array(n)
  while (n--) u8arr[n] = bstr.charCodeAt(n)
  return new File([u8arr], filename, { type: mime })
}

// ══════════════════════ ROOT ══
export default function App() {
  const [authLoading, setAuthLoading] = useState(true)
  const [supaSession, setSupaSession] = useState(null)
  const [profile, setProfile] = useState(null)
  const [feed, setFeed] = useState([])         // posts from DB
  const [follows, setFollows] = useState([])   // who current user follows
  const [notifs, setNotifs] = useState([])
  const [conversations, setConversations] = useState([])
  const [feedLoading, setFeedLoading] = useState(false)

  // ── Auth state ──
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSupaSession(session)
      if (session) loadProfile(session.user.id)
      else setAuthLoading(false)
    })
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_e, session) => {
      setSupaSession(session)
      if (session) loadProfile(session.user.id)
      else { setProfile(null); setAuthLoading(false) }
    })
    return () => subscription.unsubscribe()
  }, [])

  async function loadProfile(userId) {
    const { data, error } = await supabase.from('profiles').select('*').eq('id', userId).single()
    if (data) setProfile(data)
    setAuthLoading(false)
  }

  // ── Load feed ──
  const loadFeed = useCallback(async () => {
    setFeedLoading(true)
    const { data, error } = await supabase
      .from('posts')
      .select(`*, profiles!user_id(pseudo, avatar_url, points)`)
      .order('created_at', { ascending: false })
      .limit(50)
    if (data) {
      const userId = supaSession?.user?.id
      // Get likes by current user
      const { data: myLikes } = userId
        ? await supabase.from('likes').select('post_id').eq('user_id', userId)
        : { data: [] }
      const likedSet = new Set((myLikes || []).map(l => l.post_id))
      const mapped = data.map(p => ({
        id: p.id,
        userId: p.user_id,
        pseudo: p.pseudo || p.profiles?.pseudo || '?',
        avatarVal: p.profiles?.avatar_url || '',
        avatarFallback: '👤',
        rankName: p.rank_name,
        rankColor: p.rank_color,
        rankIcon: p.rank_icon,
        points: p.points,
        caption: p.caption,
        tags: p.tags || [],
        mediaUrl: p.media_url || '',
        isVideo: p.is_video,
        ts: new Date(p.created_at).getTime(),
        likes: Array(p.likes_count || 0).fill('x'),
        commentsList: [],
        liked: likedSet.has(p.id),
      }))
      setFeed(mapped)
    }
    setFeedLoading(false)
  }, [supaSession])

  // ── Load follows ──
  const loadFollows = useCallback(async () => {
    if (!supaSession?.user?.id) return
    const { data } = await supabase.from('follows').select('following_id').eq('follower_id', supaSession.user.id)
    setFollows((data || []).map(f => f.following_id))
  }, [supaSession])

  // ── Load notifications ──
  const loadNotifs = useCallback(async () => {
    if (!supaSession?.user?.id) return
    const { data } = await supabase
      .from('notifications')
      .select(`*, from:from_id(pseudo)`)
      .eq('user_id', supaSession.user.id)
      .order('created_at', { ascending: false })
      .limit(30)
    if (data) {
      const mapped = data.map(n => ({
        id: n.id,
        icon: n.type === 'like' ? '❤️' : n.type === 'comment' ? '💬' : '👥',
        text: n.type === 'like'
          ? `@${n.from?.pseudo} a liké ton post`
          : n.type === 'comment'
          ? `@${n.from?.pseudo} a commenté ton post`
          : `@${n.from?.pseudo} te suit maintenant`,
        ts: new Date(n.created_at).getTime(),
        read: n.read,
      }))
      setNotifs(mapped)
    }
  }, [supaSession])

  // ── Load conversations ──
  const loadConversations = useCallback(async () => {
    if (!supaSession?.user?.id) return
    const uid = supaSession.user.id
    const { data } = await supabase
      .from('messages')
      .select(`*, from:from_id(pseudo, avatar_url), to:to_id(pseudo, avatar_url)`)
      .or(`from_id.eq.${uid},to_id.eq.${uid}`)
      .order('created_at', { ascending: false })
    if (!data) return
    // Group by conversation partner
    const convMap = {}
    data.forEach(m => {
      const otherId = m.from_id === uid ? m.to_id : m.from_id
      const otherProfile = m.from_id === uid ? m.to : m.from
      if (!convMap[otherId]) {
        convMap[otherId] = {
          id: otherId,
          withId: otherId,
          withPseudo: otherProfile?.pseudo || '?',
          avatarVal: otherProfile?.avatar_url || '',
          avatarFallback: '👤',
          messages: []
        }
      }
      convMap[otherId].messages.push({
        id: m.id,
        from: m.from_id === uid ? 'me' : 'other',
        text: m.text,
        ts: new Date(m.created_at).getTime(),
      })
    })
    // Sort messages within each conv
    Object.values(convMap).forEach(conv => {
      conv.messages.sort((a,b) => a.ts - b.ts)
    })
    setConversations(Object.values(convMap))
  }, [supaSession])

  // ── Initial load ──
  useEffect(() => {
    if (supaSession) {
      loadFeed()
      loadFollows()
      loadNotifs()
      loadConversations()
    }
  }, [supaSession, loadFeed, loadFollows, loadNotifs, loadConversations])

  // ── Real-time subscriptions + polling fallback ──
  useEffect(() => {
    if (!supaSession) return
    const uid = supaSession.user.id
    const channel = supabase.channel('gymbro-realtime')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'posts' }, () => loadFeed())
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'likes' }, () => loadFeed())
      .on('postgres_changes', { event: 'DELETE', schema: 'public', table: 'likes' }, () => loadFeed())
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'comments' }, () => loadFeed())
      .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'profiles' }, () => loadProfile(uid))
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'notifications',
          filter: `user_id=eq.${uid}` }, () => loadNotifs())
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'messages',
          filter: `to_id=eq.${uid}` }, () => loadConversations())
      .subscribe()
    // Polling every 20s as fallback (real-time can miss events on mobile)
    const poll = setInterval(() => { loadFeed(); loadProfile(uid); loadNotifs(); }, 20000)
    return () => { supabase.removeChannel(channel); clearInterval(poll); }
  }, [supaSession, loadFeed, loadNotifs, loadConversations, loadProfile])

  // ══════════════════════ SUPABASE AUTH HANDLERS ══

  async function signUp({ email, pseudo, password, sexe, age, poids, taille }) {
    const { data, error } = await supabase.auth.signUp({ email, password })
    if (error) throw error
    // Create profile
    const { error: profileError } = await supabase.from('profiles').upsert({
      id: data.user.id,
      email,
      pseudo,
      sexe,
      age: Number(age),
      poids: Number(poids),
      taille: Number(taille),
    })
    if (profileError) throw profileError
    return data
  }

  async function signIn({ email, password }) {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) throw error
    return data
  }

  async function signOut() {
    await supabase.auth.signOut()
  }

  // ══════════════════════ SOCIAL HANDLERS ══

  async function addPost({ caption, tags, mediaUrl, isVideo }) {
    if (!supaSession || !profile) return
    // Try to upload media to Storage; fall back to no media if it fails
    // (avoids crashing the post if the storage bucket isn't set up yet)
    let finalMediaUrl = ''
    if (mediaUrl && mediaUrl.startsWith('data:')) {
      const ext = isVideo ? 'mp4' : 'jpg'
      const file = dataURLtoFile(mediaUrl, `post.${ext}`)
      if (file) {
        const uploaded = await uploadMedia(file, supaSession.user.id)
        if (uploaded) {
          finalMediaUrl = uploaded
        } else {
          // Storage not available — store a placeholder so post still saves
          // The image won't show but the text post will work
          console.warn('Media upload failed — posting without media')
        }
      }
    }
    const rank = getRank(profile.points || 0)
    const { data: inserted, error } = await supabase.from('posts').insert({
      user_id: supaSession.user.id,
      pseudo: profile.pseudo,
      caption: caption || '',
      tags: tags || [],
      media_url: finalMediaUrl,
      is_video: isVideo || false,
      rank_name: rank.name,
      rank_color: rank.color,
      rank_icon: rank.icon,
      points: profile.points || 0,
    }).select()
    if (error) {
      console.error('Post insert error:', error)
      throw new Error(error.message)
    }
    // Update post count in profile
    await supabase.from('profiles')
      .update({ posts_count: (profile.posts_count || 0) + 1 })
      .eq('id', supaSession.user.id)
    // Force immediate feed reload
    await loadFeed()
    return inserted
  }

  async function toggleLike(postId) {
    if (!supaSession) return
    const post = feed.find(p => p.id === postId)
    if (!post) return
    if (post.liked) {
      await supabase.from('likes').delete().eq('post_id', postId).eq('user_id', supaSession.user.id)
      await supabase.from('posts').update({ likes_count: Math.max(0, (post.likes.length || 1) - 1) }).eq('id', postId)
    } else {
      await supabase.from('likes').insert({ post_id: postId, user_id: supaSession.user.id })
      await supabase.from('posts').update({ likes_count: (post.likes.length || 0) + 1 }).eq('id', postId)
      // Notify post owner (not self)
      if (post.userId !== supaSession.user.id) {
        await supabase.from('notifications').insert({ user_id: post.userId, from_id: supaSession.user.id, type: 'like', post_id: postId })
      }
    }
    await loadFeed()
  }

  async function addComment(postId, text) {
    if (!supaSession || !profile) return
    const post = feed.find(p => p.id === postId)
    await supabase.from('comments').insert({ post_id: postId, user_id: supaSession.user.id, pseudo: profile.pseudo, text })
    await supabase.from('posts').update({ comments_count: (post?.commentsList?.length || 0) + 1 }).eq('id', postId)
    if (post && post.userId !== supaSession.user.id) {
      await supabase.from('notifications').insert({ user_id: post.userId, from_id: supaSession.user.id, type: 'comment', post_id: postId })
    }
    // Refresh comments for this post
    const { data } = await supabase.from('comments').select('*').eq('post_id', postId).order('created_at')
    setFeed(f => f.map(p => p.id !== postId ? p : { ...p, commentsList: (data || []).map(c => ({
      id: c.id, pseudo: c.pseudo, avatarVal: '', avatarFallback: '👤', text: c.text, ts: new Date(c.created_at).getTime()
    }))}))
  }

  async function toggleFollow(userId) {
    if (!supaSession || userId === supaSession.user.id) return
    const isFollowing = follows.includes(userId)
    if (isFollowing) {
      await supabase.from('follows').delete().eq('follower_id', supaSession.user.id).eq('following_id', userId)
      await supabase.from('profiles').update({ following_count: Math.max(0, (profile.following_count||1)-1) }).eq('id', supaSession.user.id)
      await supabase.from('profiles').update({ followers_count: Math.max(0, (profile.followers_count||1)-1) }).eq('id', userId)
    } else {
      await supabase.from('follows').insert({ follower_id: supaSession.user.id, following_id: userId })
      await supabase.from('profiles').update({ following_count: (profile.following_count||0)+1 }).eq('id', supaSession.user.id)
      await supabase.from('profiles').update({ followers_count: (profile.followers_count||0)+1 }).eq('id', userId)
      await supabase.from('notifications').insert({ user_id: userId, from_id: supaSession.user.id, type: 'follow' })
    }
    await loadFollows()
    await loadProfile(supaSession.user.id)
  }

  async function sendMessage(toId, toPseudo, toAvatarVal, toAvatarFb, text) {
    if (!supaSession || toId === supaSession.user.id) return
    await supabase.from('messages').insert({ from_id: supaSession.user.id, to_id: toId, text })
    await loadConversations()
  }

  async function updateProfile(updates) {
    if (!supaSession) return
    const dbUpdate = {}
    // Map UI fields to DB columns
    if (updates.pseudo !== undefined)  dbUpdate.pseudo  = updates.pseudo
    if (updates.bio    !== undefined)  dbUpdate.bio     = updates.bio
    if (updates.poids  !== undefined)  dbUpdate.poids   = Number(updates.poids)  || 0
    if (updates.taille !== undefined)  dbUpdate.taille  = Number(updates.taille) || 0
    if (updates.pinnedTrophies)        dbUpdate.pinned_trophies = updates.pinnedTrophies
    if (updates.trophyDates)           dbUpdate.trophy_dates    = updates.trophyDates
    // Handle avatar upload
    if (updates.avatar && updates.avatar.startsWith('data:')) {
      const file = dataURLtoFile(updates.avatar, 'avatar.jpg')
      if (file) {
        const url = await uploadMedia(file, supaSession.user.id)
        if (url) dbUpdate.avatar_url = url
      }
    } else if (updates.avatar) {
      dbUpdate.avatar_url = updates.avatar
    }
    if (Object.keys(dbUpdate).length > 0) {
      const { error } = await supabase.from('profiles').update(dbUpdate).eq('id', supaSession.user.id)
      if (error) { console.error('updateProfile error:', error); throw error; }
    }
    await loadProfile(supaSession.user.id)
    // Also reload feed so avatar/pseudo updates reflect on posts
    await loadFeed()
  }

  async function updateStats(statUpdates) {
    if (!supaSession) return
    await supabase.from('profiles').update(statUpdates).eq('id', supaSession.user.id)
    await loadProfile(supaSession.user.id)
  }

  // ══════════════════════ BRIDGE TO OFFLINE UI ══
  // The offline GymBro UI expects a specific appState shape.
  // We build it from Supabase data + localStorage cache.

  if (authLoading) return <Loader />

  // Convert Supabase profile to the shape the UI expects
  const uiUser = profile ? {
    email: profile.email || '',
    pseudo: profile.pseudo || '',
    password: '', // never expose
    sexe: profile.sexe || 'homme',
    age: profile.age || 0,
    poids: profile.poids || 0,
    taille: profile.taille || 0,
    bio: profile.bio || '',
    avatar: profile.avatar_url || '',
    pinnedTrophies: profile.pinned_trophies || [],
    trophyDates: profile.trophy_dates || {},
    createdAt: new Date(profile.created_at).getTime(),
  } : null

  const uiStats = profile ? {
    sessions: profile.sessions || 0,
    prs: profile.prs || 0,
    points: profile.points || 0,
    streak: profile.streak || 0,
    totalLikes: profile.total_likes || 0,
    followers: profile.followers_count || 0,
    following: profile.following_count || 0,
    posts: profile.posts_count || 0,
    earlySession: profile.early_session || false,
    nightSession: profile.night_session || false,
    weekendSessions: profile.weekend_sessions || 0,
    commentsSent: profile.comments_sent || 0,
    changedCountry: false,
    benchPR: 0,
  } : null

  // Load local caches
  const localCache = (() => {
    try { return JSON.parse(localStorage.getItem('gymbro_local') || '{}') } catch { return {} }
  })()
  const saveLocalCache = (data) => {
    localStorage.setItem('gymbro_local', JSON.stringify({ ...localCache, ...data }))
  }

  const appState = supaSession && profile ? {
    user: uiUser,
    stats: uiStats,
    posts: feed,
    programs: localCache.programs || [],
    exercises: localCache.exercises || {},
    sessionHistory: localCache.sessionHistory || [],
    country: profile.country || 'France',
    following: follows,
    conversations,
    notifs,
  } : null

  // Callbacks that the UI calls → we forward to Supabase
  const supabaseCallbacks = {
    // Auth
    onSignUp: signUp,
    onSignIn: signIn,
    onLogout: signOut,
    // Social
    addPost,
    toggleLike,
    addComment,
    toggleFollow,
    sendMessage,
    // Profile
    updateProfile: async (updates) => {
      await updateProfile(updates)
    },
    // Session save (local + stats to Supabase)
    saveSession: async (dayName, programName, result, durationSec, onLocalUpdate) => {
      if (!supaSession) return
      const now = Date.now()
      const hour = new Date(now).getHours()
      const dayOfWeek = new Date(now).getDay()
      const isEarly = hour < 7
      const isNight = hour >= 22
      const isWeekend = dayOfWeek === 0 || dayOfWeek === 6
      const today = new Date().toDateString()
      const isNewDay = (profile.last_session_date || '') !== today

      // Save to Supabase session_history
      await supabase.from('session_history').insert({
        user_id: supaSession.user.id,
        day_name: dayName,
        program_name: programName,
        duration_sec: durationSec,
        exercises: result,
      })

      // Save exercise records for progression
      for (const ex of result) {
        if (ex.sets && ex.sets.length > 0) {
          await supabase.from('exercise_records').insert({
            user_id: supaSession.user.id,
            name: ex.name,
            sets: ex.sets,
          })
        }
      }

      // Update local cache
      const newExercises = { ...localCache.exercises }
      result.forEach(ex => {
        if (!ex.sets || ex.sets.length === 0) return
        if (!newExercises[ex.name]) newExercises[ex.name] = []
        newExercises[ex.name].push({ date: now, sets: ex.sets })
      })
      const historyEntry = { id: Math.random().toString(36).slice(2), date: now, dayName, programName, durationSec, exercises: result }
      const newHistory = [historyEntry, ...(localCache.sessionHistory || [])]
      saveLocalCache({ exercises: newExercises, sessionHistory: newHistory })
      // Notify bridge to re-render with new local data
      if (onLocalUpdate) onLocalUpdate({ exercises: newExercises, sessionHistory: newHistory })

      // Update stats in Supabase
      const PR_EX = ['Développé couché','Squat','Soulevé de terre','Développé militaire','Rowing barre','Hip thrust','Presse','Tractions']
      let prCount = 0
      result.forEach(ex => {
        if (!PR_EX.includes(ex.name) || !ex.sets?.length) return
        const prevRec = (newExercises[ex.name] || []).slice(0,-1)
        const prevMax = prevRec.flatMap(h=>h.sets.map(s=>s.weight||0)).reduce((a,b)=>Math.max(a,b),-1)
        const curMax  = ex.sets.map(s=>s.weight||0).reduce((a,b)=>Math.max(a,b),-1)
        if (curMax > prevMax && prevMax >= 0) prCount++
      })

      const statUpdates = {
        sessions: (profile.sessions || 0) + (isNewDay ? 1 : 0),
        prs: (profile.prs || 0) + prCount,
        points: (profile.points || 0) + (isNewDay ? 50 : 0) + (isEarly && isNewDay ? 75 : 0) + prCount * 150,
        early_session: profile.early_session || isEarly,
        night_session: profile.night_session || isNight,
        weekend_sessions: (profile.weekend_sessions || 0) + (isWeekend && isNewDay ? 1 : 0),
        last_session_date: today,
      }
      await updateStats(statUpdates)

      // Force immediate UI refresh
      await loadFeed()
      await loadProfile(supaSession.user.id)
      return { isNewDay, isEarly, prCount }
    },
    // Local-only updates (programs etc)
    updatePrograms: (programs) => saveLocalCache({ programs }),
    updatePinnedTrophies: async (ids) => {
      await supabase.from('profiles').update({ pinned_trophies: ids }).eq('id', supaSession.user.id)
      await loadProfile(supaSession.user.id)
    },
    updateTrophyDate: async (trophyId) => {
      const dates = { ...(profile.trophy_dates || {}), [trophyId]: Date.now() }
      await supabase.from('profiles').update({ trophy_dates: dates }).eq('id', supaSession.user.id)
      await loadProfile(supaSession.user.id)
    },
    updateCountry: async (country) => {
      await supabase.from('profiles').update({ country }).eq('id', supaSession.user.id)
      await loadProfile(supaSession.user.id)
    },
  }

  // Pass everything to the offline UI
  return (
    <GymbroOffline
      supabaseMode={true}
      supabaseCallbacks={supabaseCallbacks}
      externalAppState={appState}
      isAuthenticated={!!supaSession && !!profile}
    />
  )
}

// Re-export getRank for use here
function getRank(pts) {
  const RANKS = [
    {name:"Silver I",min:0},{name:"Silver II",min:200},{name:"Silver III",min:500},
    {name:"Silver IV",min:900},{name:"Silver V",min:1400},{name:"Gold I",min:2000},
    {name:"Gold II",min:2800},{name:"Gold III",min:3700},{name:"Gold IV",min:4700},
    {name:"Gold V",min:5800},{name:"Platinum I",min:7000},{name:"Platinum II",min:8500},
    {name:"Platinum III",min:10500},{name:"Platinum IV",min:13000},{name:"Platinum V",min:16000},
    {name:"Diamond I",min:20000},{name:"Diamond II",min:25000},{name:"Diamond III",min:31000},
    {name:"Diamond IV",min:38000},{name:"Diamond V",min:46000},{name:"Emerald I",min:55000},
    {name:"Emerald II",min:66000},{name:"Emerald III",min:79000},{name:"Emerald IV",min:94000},
    {name:"Emerald V",min:111000},{name:"Elite I",min:130000},{name:"Elite II",min:155000},
    {name:"Elite III",min:185000},{name:"Elite IV",min:220000},{name:"Elite V",min:260000},
  ]
  const COLORS = {Silver:'#94A3B8',Gold:'#FBBF24',Platinum:'#67E8F9',Diamond:'#A78BFA',Emerald:'#34D399',Elite:'#FF4D4D'}
  const ICONS  = {Silver:'🥈',Gold:'🥇',Platinum:'💎',Diamond:'🔷',Emerald:'💚',Elite:'🔥'}
  let r = RANKS[0]
  for (const x of RANKS) { if (pts >= x.min) r = x }
  const tier = r.name.split(' ')[0]
  return { ...r, color: COLORS[tier] || '#94A3B8', icon: ICONS[tier] || '🥈', tier: tier.toLowerCase() }
}
