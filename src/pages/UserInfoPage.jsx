import { useEffect, useState } from "react"
import { useAuth } from "../contexts/AuthContext"
import { getUserInfo, updateUserProfile } from "../api/userApis"
import "./UserInfoPage.css"

const EMPTY_PROFILE_FORM = {
    display_name: "",
    phone_number: "",
    photo_url: "",
}

const UserInfoPage = () => {
    const { user, loading: authLoading } = useAuth()
    const [profile, setProfile] = useState(null)
    const [error, setError] = useState("")
    const [loading, setLoading] = useState(true)
    const [isEditing, setIsEditing] = useState(false)
    const [formValues, setFormValues] = useState(EMPTY_PROFILE_FORM)
    const [saveError, setSaveError] = useState("")
    const [saveMessage, setSaveMessage] = useState("")
    const [saving, setSaving] = useState(false)

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

    const handleStartEditing = () => {
        setFormValues({
            display_name: profile?.display_name ?? "",
            phone_number: profile?.phone_number ?? "",
            photo_url: profile?.photo_url ?? "",
        })
        setSaveError("")
        setSaveMessage("")
        setIsEditing(true)
    }

    const handleCancelEditing = () => {
        setIsEditing(false)
        setSaveError("")
    }

    const handleSaveProfile = async (event) => {
        event.preventDefault()
        const displayName = formValues.display_name.trim()
        if (!displayName) {
            setSaveError("Vui lòng nhập họ và tên.")
            return
        }

        setSaving(true)
        setSaveError("")
        setSaveMessage("")
        try {
            const { data } = await updateUserProfile({
                display_name: displayName,
                phone_number: formValues.phone_number.trim(),
                photo_url: formValues.photo_url.trim(),
            })
            setProfile(data)
            setIsEditing(false)
            setSaveMessage("Thông tin hồ sơ đã được cập nhật.")
        } catch (e) {
            const detail = e.response?.data?.detail
            setSaveError(typeof detail === "string" ? detail : "Không thể cập nhật thông tin. Vui lòng thử lại.")
        } finally {
            setSaving(false)
        }
    }

    const handleFormChange = (event) => {
        const { name, value } = event.target
        setFormValues((current) => ({ ...current, [name]: value }))
    }

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
                            <h2>{profile?.display_name || "Chưa có tên"}</h2>
                            <span className="profile-email-sub">{profile?.email ?? "-"}</span>
                        </div>
                        {!isEditing && (
                            <button type="button" className="profile-button profile-button-primary profile-edit-button" onClick={handleStartEditing}>
                                Sửa hồ sơ
                            </button>
                        )}
                    </div>

                    {isEditing ? (
                        <form className="profile-edit-form" onSubmit={handleSaveProfile}>
                            <label className="profile-field">
                                <span>Họ và tên</span>
                                <input
                                    name="display_name"
                                    value={formValues.display_name}
                                    onChange={handleFormChange}
                                    maxLength={100}
                                    autoComplete="name"
                                    required
                                />
                            </label>
                            <label className="profile-field">
                                <span>Số điện thoại</span>
                                <input
                                    name="phone_number"
                                    type="tel"
                                    value={formValues.phone_number}
                                    onChange={handleFormChange}
                                    autoComplete="tel"
                                    placeholder="Nhập số điện thoại"
                                />
                            </label>
                            <label className="profile-field profile-field-full">
                                <span>Đường dẫn ảnh đại diện</span>
                                <input
                                    name="photo_url"
                                    type="url"
                                    value={formValues.photo_url}
                                    onChange={handleFormChange}
                                    autoComplete="url"
                                    placeholder="https://..."
                                />
                                <small>Để trống nếu muốn xóa ảnh đại diện hiện tại.</small>
                            </label>
                            {saveError && <p className="profile-feedback-error" role="alert">{saveError}</p>}
                            <div className="profile-form-actions">
                                <button type="button" className="profile-button profile-button-secondary" onClick={handleCancelEditing} disabled={saving}>
                                    Hủy
                                </button>
                                <button type="submit" className="profile-button profile-button-primary" disabled={saving}>
                                    {saving ? "Đang lưu..." : "Lưu thay đổi"}
                                </button>
                            </div>
                        </form>
                    ) : (
                        <>
                            <div className="profile-details-list">
                                <div className="detail-row">
                                    <span className="detail-label">Họ và tên:</span>
                                    <span className="detail-value">{profile?.display_name || "-"}</span>
                                </div>
                                <div className="detail-row">
                                    <span className="detail-label">Email:</span>
                                    <span className="detail-value">{profile?.email ?? "-"}</span>
                                </div>
                                <div className="detail-row">
                                    <span className="detail-label">Số điện thoại:</span>
                                    <span className="detail-value">{profile?.phone_number || "-"}</span>
                                </div>
                                <div className="detail-row">
                                    <span className="detail-label">Vai trò (Role):</span>
                                    <span className="detail-value role-badge">{profile?.role ?? "User"}</span>
                                </div>
                            </div>
                            {saveMessage && <p className="profile-feedback-success" role="status">{saveMessage}</p>}
                        </>
                    )}
                </div>

            </div>
        </div>
    )
}

export default UserInfoPage
