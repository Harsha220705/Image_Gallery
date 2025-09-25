import React, { useState } from "react"; 

const Test = () => {
    const [count,setCount]=useState(0)
    return (
        <>
        <h2>The Counter value is:{count}</h2>
        <button onClick={()=>{setCount(count+1)}}>Increment</button>
        <button onClick={()=>{setCount(count-1)}}>Decrement</button>
        <button onClick={()=>{setCount(0)}}>Reset</button>
        <h2>Conditional Render</h2>
        </>
    );
};
export default Test;