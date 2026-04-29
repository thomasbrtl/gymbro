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
}

// ── Push notifications ──
const VAPID_PUBLIC_KEY = import.meta.env.VITE_VAPID_PUBLIC_KEY || ''

function urlBase64ToUint8Array(base64String) {
  const padding = '='.repeat((4 - base64String.length % 4) % 4)
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/')
  const rawData = atob(base64)
  return new Uint8Array([...rawData].map(c => c.charCodeAt(0)))
}

async function registerPush(userId) {
  if (!('serviceWorker' in navigator) || !('PushManager' in window) || !VAPID_PUBLIC_KEY) return
  try {
    const reg = await navigator.serviceWorker.register('/sw.js')
    await navigator.serviceWorker.ready
    const permission = await Notification.requestPermission()
    if (permission !== 'granted') return
    const existing = await reg.pushManager.getSubscription()
    const sub = existing || await reg.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: urlBase64ToUint8Array(VAPID_PUBLIC_KEY),
    })
    await supabase.from('push_subscriptions').upsert({
      user_id: userId,
      subscription: sub.toJSON(),
      updated_at: new Date().toISOString(),
    }, { onConflict: 'user_id,endpoint' })
  } catch (e) { console.warn('Push registration failed:', e) }
}

async function sendPushTo(userId, title, body, tag) {
  if (!userId) return
  try {
    await supabase.functions.invoke('send-push', { body: { userId, title, body, tag } })
  } catch (e) { console.warn('sendPush failed:', e) }
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
  const [challenges, setChallenges]       = useState([])
  const [referrals, setReferrals]         = useState({ code:'', list:[], count:0 })
  const [soloChallenge, setSoloChallenge] = useState(null)
  const [localData, setLocalData]         = useState({})

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
        registerPush(session.user.id)
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
      userId: (supaSession?.user?.id && p.user_id === supaSession.user.id) ? 'me' : p.user_id,
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
    const { data } = await supabase
      .from('follows')
      .select('following_id, profiles!following_id(id, pseudo, avatar_url, points, sexe, country)')
      .eq('follower_id', supaSession.user.id)
    // follows = array of full profile objects (with id, pseudo, avatar_url…)
    const profiles = (data || []).map(f => ({
      id: f.following_id,
      pseudo: f.profiles?.pseudo || f.following_id,
      avatarUrl: f.profiles?.avatar_url || '',
      points: f.profiles?.points || 0,
      sexe: f.profiles?.sexe || 'homme',
      country: f.profiles?.country || '',
    }))
    setFollows(profiles)
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

  const loadChallenges = useCallback(async () => {
    if (!supaSession?.user?.id) return
    const uid = supaSession.user.id
    const { data } = await supabase
      .from('challenges')
      .select('*, challenger:challenger_id(pseudo, avatar_url, sexe), opponent:opponent_id(pseudo, avatar_url, sexe)')
      .or(`challenger_id.eq.${uid},opponent_id.eq.${uid}`)
      .order('created_at', { ascending: false })
      .limit(20)
    if (!data) return
    setChallenges(data.map(c => ({
      id: c.id,
      challengerId: c.challenger_id,
      opponentId: c.opponent_id,
      challengerPseudo: c.challenger?.pseudo || '?',
      opponentPseudo: c.opponent?.pseudo || '?',
      challengerAvatar: c.challenger?.avatar_url || '',
      opponentAvatar: c.opponent?.avatar_url || '',
      type: c.type,
      exercise: c.exercise,
      title: c.title,
      status: c.status,
      challengerScore: c.challenger_score || 0,
      opponentScore: c.opponent_score || 0,
      endDate: c.end_date,
      createdAt: new Date(c.created_at).getTime(),
      winnerId: c.winner_id,
    })))
  }, [supaSession])

  useEffect(() => {
    if (supaSession) { loadFeed(); loadFollows(); loadNotifs(); loadConversations(); loadChallenges(); loadReferrals(); loadSoloChallenge() }
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
      .on('postgres_changes', { event: '*', schema: 'public', table: 'challenges', filter: `challenger_id=eq.${uid}` }, () => loadChallenges())
      .on('postgres_changes', { event: '*', schema: 'public', table: 'challenges', filter: `opponent_id=eq.${uid}` }, () => loadChallenges())
      .on('postgres_changes', { event: '*', schema: 'public', table: 'referrals', filter: `referrer_id=eq.${uid}` }, () => loadReferrals())
      .on('postgres_changes', { event: '*', schema: 'public', table: 'solo_challenges', filter: `user_id=eq.${uid}` }, () => loadSoloChallenge())
      .subscribe()
    const poll = setInterval(() => { loadFeed(); loadProfile(uid); loadNotifs() }, 25000)
    return () => { supabase.removeChannel(ch); clearInterval(poll) }
  }, [supaSession, loadFeed, loadProfile, loadNotifs, loadConversations])

  // ══════════════════════ AUTH ══
  async function signUp({ email, pseudo, password, sexe, age, poids, taille, country, referralCode }) {
    const { data, error } = await supabase.auth.signUp({ email, password })
    if (error) throw error
    const uid = data.user.id
    await new Promise(r => setTimeout(r, 600))
    await supabase.from('profiles').upsert({ id: uid, email, pseudo, sexe, age: +age||0, poids: +poids||0, taille: +taille||0, country: country||'France', points: 0, sessions: 0, prs: 0, referred_by: referralCode?.toUpperCase() || null })
    setLocalKey(uid); setLocalData({})
    // Handle referral
    if (referralCode?.trim()) {
      const code = referralCode.trim().toUpperCase()
      const { data: referrerProf } = await supabase.from('profiles').select('id').eq('referral_code', code).maybeSingle()
      if (referrerProf) {
        try { await supabase.from('referrals').insert({ referrer_id: referrerProf.id, referred_id: uid, status: 'pending' }) } catch(e) {}
      }
    }
    await loadProfile(uid); await loadFeed(); await loadFollows()
    registerPush(uid)
    return data
  }

  async function signIn({ email, password }) {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) throw error
    if (data.user) {
      setLocalKey(data.user.id)
      setLocalData(readLocal())
      await loadProfile(data.user.id); await loadFeed(); await loadFollows()
      registerPush(data.user.id)
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
        if (post.userId !== uid) {
          supabase.from('notifications').insert({ user_id: post.userId, from_id: uid, type: 'like', post_id: postId }).then(()=>{}).catch(()=>{})
          sendPushTo(post.userId, '❤️ Nouveau like', `@${profile?.pseudo} a liké ta photo`, 'like')
        }
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
      supabase.from('notifications').insert({ user_id: post.userId, from_id: supaSession.user.id, type: 'comment', post_id: postId }).then(()=>{}).catch(()=>{})
      sendPushTo(post.userId, '💬 Nouveau commentaire', `@${profile.pseudo} a commenté ton post`, 'comment')
    }
    loadFeed()
  }

  async function toggleFollow(userId) {
    if (!supaSession || userId === supaSession.user.id) return
    const uid = supaSession.user.id
    const isFollowing = follows.some(f => f.id === userId)
    setFollows(f => isFollowing ? f.filter(id => id !== userId) : [...f, userId])
    try {
      if (isFollowing) {
        await supabase.from('follows').delete().eq('follower_id', uid).eq('following_id', userId)
      } else {
        await supabase.from('follows').insert({ follower_id: uid, following_id: userId })
        supabase.from('notifications').insert({ user_id: userId, from_id: uid, type: 'follow' }).then(()=>{}).catch(()=>{})
        sendPushTo(userId, '👥 Nouvel abonné', `@${profile?.pseudo} te suit maintenant`, 'follow')
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

  // ══════════════════════ REFERRALS ══
  const loadReferrals = useCallback(async () => {
    if (!supaSession?.user?.id) return
    const uid = supaSession.user.id
    // Get own referral code
    const { data: prof } = await supabase.from('profiles').select('referral_code, premium_until, is_premium').eq('id', uid).single()
    // Get referrals list
    const { data: refs } = await supabase.from('referrals')
      .select('*, referred:referred_id(pseudo, avatar_url)')
      .eq('referrer_id', uid)
      .order('created_at', { ascending: false })
    const validated = (refs || []).filter(r => r.status === 'validated').length
    setReferrals({
      code: prof?.referral_code || '',
      premiumUntil: prof?.premium_until,
      isPremium: prof?.is_premium || false,
      list: (refs || []).map(r => ({
        id: r.id,
        pseudo: r.referred?.pseudo || '?',
        avatar: r.referred?.avatar_url || '',
        status: r.status,
        createdAt: new Date(r.created_at).getTime(),
      })),
      count: validated,
    })
  }, [supaSession])

  // ══════════════════════ SOLO CHALLENGES ══
  const loadSoloChallenge = useCallback(async () => {
    if (!supaSession?.user?.id) return
    const { data } = await supabase.from('solo_challenges')
      .select('*').eq('user_id', supaSession.user.id).eq('status', 'active').maybeSingle()
    if (!data) { setSoloChallenge(null); return }
    setSoloChallenge({
      id: data.id, type: data.type, exercise: data.exercise,
      title: data.title, target: data.target, current: data.current,
      xpReward: data.xp_reward, endDate: data.end_date,
      status: data.status, createdAt: new Date(data.created_at).getTime(),
    })
  }, [supaSession])

  // ══════════════════════ CHALLENGES ══
  async function createChallenge({ opponentId, type, exercise, title, durationDays }) {
    if (!supaSession) throw new Error('Tu dois être connecté')
    if (!profile) throw new Error('Profil non chargé, réessaie dans quelques secondes')
    if (!opponentId) throw new Error('Adversaire introuvable')
    const endDate = new Date(Date.now() + durationDays * 86400000).toISOString()
    const { error } = await supabase.from('challenges').insert({
      challenger_id: supaSession.user.id,
      opponent_id: opponentId,
      type, exercise: exercise || null, title,
      status: 'pending',
      challenger_score: 0, opponent_score: 0,
      end_date: endDate,
    })
    if (error) throw new Error(error.message)
    // Notif in-app
    supabase.from('notifications').insert({
      user_id: opponentId, from_id: supaSession.user.id, type: 'challenge',
    }).then(()=>{}).catch(()=>{})
    // Push notification
    sendPushTo(opponentId, '⚡ Nouveau défi !', `@${profile.pseudo} te lance un défi : ${title}`, 'challenge')
    await loadChallenges()
  }

  async function respondChallenge(challengeId, accept) {
    if (!supaSession) return
    const status = accept ? 'active' : 'declined'
    await supabase.from('challenges').update({ status }).eq('id', challengeId)
    await loadChallenges()
  }

  async function deleteChallenge(challengeId) {
    if (!supaSession) return
    await supabase.from('challenges').delete().eq('id', challengeId)
    await loadChallenges()
  }

  async function createSoloChallenge({ type, exercise, title, target, durationDays }) {
    if (!supaSession) return
    if (soloChallenge) throw new Error('Un défi solo est déjà en cours')
    // ── 1 défi perso max par semaine ──
    const weekStart = new Date(); weekStart.setHours(0,0,0,0); weekStart.setDate(weekStart.getDate() - weekStart.getDay() + (weekStart.getDay()===0?-6:1))
    const { count: weekCount } = await supabase.from('solo_challenges').select('*', { count: 'exact', head: true }).eq('user_id', supaSession.user.id).gte('created_at', weekStart.toISOString())
    if (weekCount && weekCount >= 1) throw new Error('1 défi perso maximum par semaine')
    // ── XP réduit ──
    const xpReward = 150 // XP fixe pour tous les défis solo
    const endDate = new Date(Date.now() + durationDays * 86400000).toISOString()
    const { error } = await supabase.from('solo_challenges').insert({
      user_id: supaSession.user.id, type, exercise: exercise || null,
      title, target, current: 0, xp_reward: xpReward, end_date: endDate, status: 'active',
    })
    if (error) throw error
    await loadSoloChallenge()
  }

  async function deleteSoloChallenge(id) {
    if (!supaSession) return
    await supabase.from('solo_challenges').delete().eq('id', id)
    setSoloChallenge(null)
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

    // ── 3. Update challenge scores ──
    if (supaSession?.user?.id) {
      const uid2 = supaSession.user.id
      const { data: activeChallenges } = await supabase
        .from('challenges')
        .select('*')
        .or(`challenger_id.eq.${uid2},opponent_id.eq.${uid2}`)
        .eq('status', 'active')
      if (activeChallenges?.length) {
        for (const ch of activeChallenges) {
          const isChallenger = ch.challenger_id === uid2
          const scoreField = isChallenger ? 'challenger_score' : 'opponent_score'
          let newScore = isChallenger ? (ch.challenger_score || 0) : (ch.opponent_score || 0)
          if (ch.type === 'sessions') {
            // 1 session par jour max pour les défis
            const todayStr = new Date().toDateString()
            const lastScoreDate = ch.last_session_date || ''
            if (lastScoreDate === todayStr) continue // Already scored today
            newScore += 1
            const isExpired2 = ch.end_date && new Date(ch.end_date) < new Date()
            if (isExpired2) {
              const cs2 = isChallenger ? newScore : (ch.challenger_score||0)
              const os2 = isChallenger ? (ch.opponent_score||0) : newScore
              const winner2 = cs2 > os2 ? ch.challenger_id : cs2 < os2 ? ch.opponent_id : null
              await supabase.from('challenges').update({ [scoreField]: newScore, status: 'finished', winner_id: winner2, last_session_date: todayStr }).eq('id', ch.id)
            } else {
              await supabase.from('challenges').update({ [scoreField]: newScore, last_session_date: todayStr }).eq('id', ch.id)
            }
            loadChallenges()
            continue
          } else if (ch.type === 'volume') {
            const vol = result.reduce((sum, ex) => sum + ex.sets.reduce((s2, set) => s2 + ((set.reps||0) * (set.weight||0)), 0), 0)
            newScore += Math.round(vol)
          } else if (ch.type === 'pr' && ch.exercise) {
            const exResult = result.find(r => r.name === ch.exercise)
            if (exResult) {
              const sessionMax = exResult.sets.reduce((m, s) => Math.max(m, s.weight||0), 0)
              if (sessionMax > newScore) newScore = sessionMax
            }
          } else if (ch.type === 'streak') {
            newScore += 1
          }
          // Check if challenge expired
          const isExpired = ch.end_date && new Date(ch.end_date) < new Date()
          if (isExpired) {
            const cs = isChallenger ? newScore : (ch.challenger_score||0)
            const os = isChallenger ? (ch.opponent_score||0) : newScore
            const winnerId = cs > os ? ch.challenger_id : cs < os ? ch.opponent_id : null
            await supabase.from('challenges').update({ [scoreField]: newScore, status: 'finished', winner_id: winnerId }).eq('id', ch.id)
          } else {
            await supabase.from('challenges').update({ [scoreField]: newScore }).eq('id', ch.id)
          }
        }
        loadChallenges()
      }
    }

    // ── 4. Update solo challenge ──
    if (supaSession?.user?.id && soloChallenge?.status === 'active') {
      const sc = soloChallenge
      let newCurrent = sc.current
      if (sc.type === 'sessions') newCurrent += 1
      else if (sc.type === 'volume') {
        const vol = result.reduce((s, ex) => s + ex.sets.reduce((s2, set) => s2 + ((set.reps||0)*(set.weight||0)), 0), 0)
        newCurrent += Math.round(vol)
      } else if (sc.type === 'pr' && sc.exercise) {
        const exResult = result.find(r => r.name === sc.exercise)
        if (exResult) {
          const sessionMax = exResult.sets.reduce((m, s) => Math.max(m, s.weight||0), 0)
          if (sessionMax > newCurrent) newCurrent = sessionMax
        }
      } else if (sc.type === 'streak') newCurrent += 1
      const isExpired = sc.endDate && new Date(sc.endDate) < new Date()
      const isSuccess = newCurrent >= sc.target
      let newStatus = 'active'
      let xpBonus = 0
      if (isSuccess) { newStatus = 'success'; xpBonus = sc.xpReward }
      else if (isExpired) { newStatus = 'failed' }
      await supabase.from('solo_challenges').update({ current: newCurrent, status: newStatus }).eq('id', sc.id)
      if (xpBonus > 0) {
        await supabase.from('profiles').update({ points: (profile?.points||0) + xpBonus }).eq('id', supaSession.user.id)
        sendPushTo(supaSession.user.id, '🎯 Défi solo accompli !', `+${xpBonus} XP — ${sc.title}`, 'solo_success').catch(()=>{})
        // In-app notif via supabase notifications table
        supabase.from('notifications').insert({ user_id: supaSession.user.id, from_id: supaSession.user.id, type: 'solo_success' }).then(()=>{}).catch(()=>{})
      }
      loadSoloChallenge()
    }

    // ── 5. Validate referral on first session ──
    if (supaSession?.user?.id && profile?.sessions === 0) {
      const { data: myRef } = await supabase.from('referrals').select('id, referrer_id').eq('referred_id', supaSession.user.id).eq('status', 'pending').maybeSingle()
      if (myRef) {
        await supabase.from('referrals').update({ status: 'validated', validated_at: new Date().toISOString() }).eq('id', myRef.id)
        // Check if referrer now has 5 validated referrals
        const { count } = await supabase.from('referrals').select('*', { count: 'exact', head: true }).eq('referrer_id', myRef.referrer_id).eq('status', 'validated')
        if (count && count >= 5) {
          const premiumUntil = new Date(Date.now() + 30 * 86400000).toISOString()
          await supabase.from('profiles').update({ is_premium: true, premium_until: premiumUntil }).eq('id', myRef.referrer_id)
          sendPushTo(myRef.referrer_id, '🎉 Premium offert !', 'Tu as parrainé 5 personnes — 1 mois Premium gratuit activé !', 'premium')
        }
      }
    }

    const xpGain = supaSession && profile ? (((profile.last_session_date || '') !== today ? 50 : 0) + (isEarly && (profile.last_session_date || '') !== today ? 75 : 0) + prCount * 150) : 0
    return { isNewDay: (profile?.last_session_date || '') !== today, isEarly, prCount, xpGain }
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
        createChallenge, respondChallenge, deleteChallenge,
        createSoloChallenge, deleteSoloChallenge,
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
    following: follows, conversations, notifs, challenges, referrals, soloChallenge,
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
      createChallenge, respondChallenge, deleteChallenge,
      createSoloChallenge, deleteSoloChallenge,
    }}
    externalAppState={appState}
    isAuthenticated={true}
  />
}
