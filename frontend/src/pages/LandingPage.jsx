import { Link, useNavigate } from "react-router-dom";

export default function LandingPage() {

  let navigate = useNavigate();

  let redirectToAuthPage = () => {
    navigate("/auth");
  }

  let randomMeetingRoom = () => {

    const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
    let meetingCode = "";

    for(let i = 0; i < 6; i++){
      meetingCode += chars.charAt(Math.floor(Math.random() * chars.length));
    }

    navigate(`/meet/${meetingCode}`);
  }



  return (
    <div className="landingPageContainer">

      <nav>

        <div className="navHeader">
          <h2>Connectify</h2>
        </div>

        <div className="navList">
          <p onClick={randomMeetingRoom}>Join as Guest</p>

          <p onClick={redirectToAuthPage}>Register</p>

          <div onClick={redirectToAuthPage} role="button">
            <p>Login</p>
          </div>

        </div>

      </nav>

      <div className="landingPageMainContainer">

        <div>
          <h1><span style={{color: "#FF9839"}}>Connect</span> with your loved ones</h1>

          <p>Cover a distance by Connectify</p>
          
          <Link to={"/auth"} style={{ textDecoration: "none" }}>
            <div role="button">
              Get Started
            </div>
          </Link>

        </div>

        <div>
          <img src="/mobile.png" alt="" />
        </div>
      </div>

    </div>
  )
}