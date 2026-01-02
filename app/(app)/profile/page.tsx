import { UsernameForm } from "@/components/profile/username-form";
import { getCurrentProfile } from "@/lib/server/get-current-profile";

export default async function ProfilePage() {
    const profile = await getCurrentProfile()

    if (!profile) return null

    return(
        <div className="flex flex-col gap-10">
            <div className="flex flex-col pl-2 gap-2">
                <h1 className="text-2xl font-semibold">Hi, {profile.username}</h1>
                <h6 className="text-xs text-muted-foreground">These are the profile settings. You can change username and avatar from here!</h6>
            </div>
            <UsernameForm initialUsername={profile.username}/>
        </div>
    )
}