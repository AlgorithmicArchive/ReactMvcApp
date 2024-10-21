export async function Login(formdata){
    const response = await fetch('/Home/Login',{method:'POST',body:formdata});
    const data = await response.json();
    return data;
}