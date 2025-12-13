'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'

export function SupabaseTest() {
    const [message, setMessage] = useState<string | null>(null)
    const [error, setError] = useState<string | null>(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        async function testConnection() {
            try {
                const { data, error } = await supabase
                    .from('test_connection')
                    .select('message')
                    .single()

                if (error) {
                    setError(error.message)
                } else {
                    setMessage(data?.message)
                }
            } catch (err) {
                setError(err instanceof Error ? err.message : '未知错误')
            } finally {
                setLoading(false)
            }
        }
        testConnection()
    }, [])

    return (
        <div className="p-4 rounded-lg border bg-white shadow-sm">
            <h3 className="font-bold text-gray-800 mb-2">Supabase 连接测试</h3>
            {loading && <p className="text-gray-500">🔄 连接中...</p>}
            {error && <p className="text-red-500">❌ 错误: {error}</p>}
            {message && <p className="text-green-600">✅ {message}</p>}
        </div>
    )
}
