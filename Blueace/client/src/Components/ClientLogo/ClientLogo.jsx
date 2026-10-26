import React, { useEffect } from 'react'
import axios from 'axios'

const ClientLogo = () => {
    const [allClientLogo, setAllClientLogo] = useState([]);
    const fetchClientLogo = async () => {
        try {
            const { data } = await axios.get('https://www.api.blueaceindia.com/api/v1/get-all-client-logo')
            setAllClientLogo(data.data)
        } catch (error) {
            console.log("Internal server error", error)
        }
    }
    useEffect(() => {
        fetchClientLogo();
    }, [])
    return (
        <div>

        </div>
    )
}

export default ClientLogo
