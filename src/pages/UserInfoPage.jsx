import { useEffect, useState } from "react"
import { useAuth } from "../contexts/AuthContext"
import { getUserInfo } from "../api/userApis"
import "./UserInfoPage.css" // Import file CSS riêng

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
            .then(({ data }) => setProfile(data))
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

    if (loading) return <div className="user-info-loading">Đang tải...</div>
    if (error) return <div className="user-info-error">{error}</div>

    return (
        <div className="user-info-page">
            <div className="user-info-container">
                
                {/* Banner trang cá nhân */}
                <div className="user-info-banner">
                    <h1>Hồ Sơ Cá Nhân</h1>
                    <p>Thông tin chi tiết tài khoản của bạn trên hệ thống</p>
                </div>

                {/* Thẻ thông tin */}
                <div className="user-profile-card">
                    <div className="profile-header-section">
                        {profile?.photo_url ? (
                            <img src={profile.photo_url} alt="Avatar" className="profile-avatar" />
                        ) : (
                            <div className="profile-avatar-placeholder">
                                {(profile?.display_name?.[0] || 'U').toUpperCase()}
                            </div>
                        )}
                        <div className="profile-intro">
                            <h2>{profile?.display_name ?? "Chưa có tên"}</h2>
                            <span className="profile-email-sub">{profile?.email ?? "-"}</span>
                        </div>
                    </div>

                    <div className="profile-details-list">
                        <div className="detail-row">
                            <span className="detail-label">Họ và tên:</span>
                            <span className="detail-value">{profile?.display_name ?? "-"}</span>
                        </div>
                        <div className="detail-row">
                            <span className="detail-label">Email:</span>
                            <span className="detail-value">{profile?.email ?? "-"}</span>
                        </div>
                        <div className="detail-row">
                            <span className="detail-label">Số điện thoại:</span>
                            <span className="detail-value">{profile?.phone_number ?? "-"}</span>
                        </div>
                        <div className="detail-row">
                            <span className="detail-label">Vai trò (Role):</span>
                            <span className="detail-value role-badge">{profile?.role ?? "User"}</span>
                        </div>
                    </div>
                </div>

            </div>
        </div>
    )
}

export default UserInfoPage
