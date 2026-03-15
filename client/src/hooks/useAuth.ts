import { useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../utils/api'
import { useStore } from '../store/StoreContext'
import type { User } from '../types'

export function useAuth() {
    const { user, setUser } = useStore()
    const navigate = useNavigate()

    const login = useCallback(async (email: string, password: string) => {
        const res: any = await api.post('/auth/login', { email, password })
        localStorage.setItem('token', res.token)
        setUser(res.user as User)
        navigate('/')
    }, [])

    const register = useCallback(async (email: string, username: string, password: string) => {
        const res: any = await api.post('/auth/register', { email, username, password })
        localStorage.setItem('token', res.token)
        setUser(res.user as User)
        navigate('/')
    }, [])

    const logout = useCallback(() => {
        localStorage.removeItem('token')
        setUser(null)
        navigate('/login')
    }, [])

    const checkAuth = useCallback(async () => {
        const token = localStorage.getItem('token')
        if (!token) return null
        try {
            const res: any = await api.get('/auth/me')
            setUser(res as User)
            return res
        } catch {
            localStorage.removeItem('token')
            setUser(null)
            return null
        }
    }, [])

    return { user, login, register, logout, checkAuth }
}
