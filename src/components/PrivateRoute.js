import { Navigate } from "react-router-dom";

export default function PrivateRoute(props)
{
    if(props.type == "profile")
        return props.jwt ? props.children : <Navigate to="/login" />;
    else
        return props.jwt ? <Navigate to="/home" /> : props.children;
}