import { Link } from "react-router-dom";

export default function LandingPage() {
  return (
    <div className="landingPageContainer">

      <nav>

        <div className="navHeader">
          <h2>Connectify</h2>
        </div>

        <div className="navList">
          <p>Join as Guest</p>
          <p>Register</p>
          <div role="button">
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