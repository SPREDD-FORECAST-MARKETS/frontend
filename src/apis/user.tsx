import axios from "axios"



export const updateMe = async (username: string, about: string, profile_pic: string, authToken: string) => {

    try {

        const resp = await axios.post(
            `${import.meta.env.VITE_BACKEND_URL}/user/update-me`,
            {
                username,
                about,
                profile_pic,
            },
            {
                headers: {
                    'Authorization': `Bearer ${authToken}`,
                    'Content-Type': 'application/json',
                    'Accept': '*/*',
                },
            }
        );

        return [null, resp.status]

    } catch (error: any) {
        return [null, -1]
    }

}