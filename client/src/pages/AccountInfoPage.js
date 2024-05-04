import React from "react";
import "../styles/HomPage.scss";
import { useAuth0 } from "@auth0/auth0-react";
import "../styles/AccountInfo.scss";

function AccountInfoPage() {
  const { user, isAuthenticated, isLoading } = useAuth0();

  if (isLoading) {
    return <div>Loading ...</div>;
  }

  return (
    isAuthenticated && (
      <div className="flex">
        <div className="flex-item">
          <h1 className="title">My Account Information</h1>
          <hr className="solid" />
          <img
            src={process.env.PUBLIC_URL + "/default_user_image.png"}
            alt={user.name}
            className="profile-image"
          />
          <div className="field">Name</div>
          <h2 className="value">{user.name}</h2>
          <div className="field">Username</div>
          <h2 className="value">{user.nickname}</h2>
          <div className="field">Email</div>
          <p className="value">{user.email}</p>
        </div>
      </div>
    )
  );
}

export default AccountInfoPage;
