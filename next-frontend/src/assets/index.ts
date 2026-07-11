import LoginImage from './login.png'
import SignupImage from './signup.png'
const CLOUDFRONT_URL = process.env.NEXT_PUBLIC_CLOUDFRONT_URL
const DefaultAvatar = `${CLOUDFRONT_URL}/images/defaults/profile/avatar/default-avatar.jpg`
const DefaultGuildavatar = `${CLOUDFRONT_URL}/images/defaults/guild/avatar/default-guild-avatar.jpg`
const DefaultGuildCover = `${CLOUDFRONT_URL}/images/defaults/guild/coverImage/default-guild-cover.jpg`
export {
    LoginImage,
    SignupImage,
    DefaultAvatar,
    DefaultGuildavatar,
    DefaultGuildCover
}