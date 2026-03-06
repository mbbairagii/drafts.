import { useState, useEffect } from 'react'
import api from '../utils/api'
import { useStore } from '../store/StoreContext'
import type { User } from '../types'

export function useAuth() {
    const { user, setUser, setToken } = useStore()
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const token = localStorage.getItem('drafts_token')
        if (!token) { setLoading(false); return }
        api.get('/auth/me')
            .then(res => { setUser(res.data.user); setLoading(false) })
            .catch(() => { localStorage.removeItem('drafts_token'); setToken(null); setLoading(false) })
    }, [])

    const login = async (email: string, password: string) => {
        const res = await api.post('/auth/login', { email, password })
        localStorage.setItem('drafts_token', res.data.token)
        setToken(res.data.token)
        setUser(res.data.user)
    }

    const register = async (email: string, username: string, password: string) => {
        const res = await api.post('/auth/register', { email, username, password })
        localStorage.setItem('drafts_token', res.data.token)
        setToken(res.data.token)
        setUser(res.data.user)
    }

    const logout = () => {
        localStorage.removeItem('drafts_token')
        setToken(null)
        setUser(null)
    }

    return { user, loading, login, register, logout }
}