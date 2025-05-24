import axios from "axios"


interface UploadFileResponse {
    url: string;
    filename: string;
    size: number;
    mimetype: string;
}

export const uploadFile = async (file: File, path: string): Promise<[string | null, number]> => {

    const formData = new FormData();
    formData.append("file", file);
    formData.append("folder", path)

    try {
        const resp = await axios.post<UploadFileResponse>(`${import.meta.env.VITE_BACKEND_URL}/files/upload`, formData, {
            headers: {
                'Content-Type': "multipart/form-data",
                "Accept": 'application/json'
            }
        })
    
        return [resp.data.url, resp.status]
    } catch (error: any) {
        console.error("Request Failed: ", error);
        return [null, -1]
    }
    

}