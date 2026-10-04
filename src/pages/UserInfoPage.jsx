import { useEffect, useState } from "react"
import { useAuth } from "../contexts/AuthContext"
import { getUserInfo } from "../api/userApis"

const UserInfoPage = () => {
    const { user, loading: authLoading } = useAuth()
    const [profile, setProfile] = useState(null)
    const [error, setError] = useState("")
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        if (authLoading) return
        if (!user) {
            setError("Bạn chưa đăng nhập")
            setLoading(false)
            return
        }

        getUserInfo()
            .then(setProfile)
            .catch((e) => {
                const status = e.response?.status
                setError(
                    status === 404
                        ? "Tài khoản chưa được đồng bộ, hãy đăng nhập lại"
                        : e.response?.data?.detail ?? "Không tải được thông tin"
                )
            })
            .finally(() => setLoading(false))
    }, [user, authLoading])

    if (loading) return <p>Đang tải...</p>
    if (error) return <p>{error}</p>

    return (
        <div>
            {profile.photo_url && <img src={profile.photo_url} alt="" width={80} />}
            <h2>{profile.display_name ?? "Chưa có tên"}</h2>
            <p>Email: {profile.email ?? "-"}</p>
            <p>SĐT: {profile.phone_number ?? "-"}</p>
            <p>Vai trò: {profile.role}</p>
        </div>
    )
}

export default UserInfoPage