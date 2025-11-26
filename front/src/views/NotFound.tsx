import { useEffect } from "react"

const NotFound = () => {
    useEffect(() => {
        window.location.replace("https://xujingyichang.top/404")
    }, [])
    return <div>Not Found</div>
}

export default NotFound;