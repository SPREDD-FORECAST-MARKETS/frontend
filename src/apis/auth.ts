import axios from "axios"
import type { User } from "../types/apis";




export const loginApi  = async (authToken: string): Promise<[User | null, number]> => {
    
    try {
        const resp = await axios.post<User>(`${import.meta.env.VITE_BACKEND_URL}/auth/login`, '', {
            headers: {
                'accept': "*/*",
                "Authorization": `Bearer ${authToken}`
            }
        });
        
        return [resp.data, resp.status]
    } catch {
        return [null, -1];
    }   
}

