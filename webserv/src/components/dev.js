import React from "react";
import { useEffect, useState} from "react";

export const Dev = () => {
    const [initialState, setIntialState] =  useState([])

    useEffect(() => {
        fetch('http://localhost').then(res => {
            if(res.ok){
                return res.json()
            }
        }).then(jsonResponse => setIntialState(jsonResponse))
    },[])
    return(<div>
        {initialState.length > 0 && initialState.map(e => <li>{e}</li>)}
    </div>)
}