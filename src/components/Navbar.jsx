import React, { useContext, useState } from "react";
import { Navbar, Nav, NavDropdown, Container } from "react-bootstrap";
import { Link, useNavigate } from "react-router-dom";
import { UserContext } from "../UserContext";

const MyNavbar = () => {
  const [expanded, setExpanded] = useState(false); // Manage expanded state
  const navigate = useNavigate();
  const {
    userType,
    setUserType,
    setToken,
    setUsername,
    setProfile,
    username,
    profile,
    designation,
    verified,
    setVerified,
  } = useContext(UserContext);

  const handleLogout = () => {
    setToken(null);
    setUserType(null);
    setUsername(null);
    setProfile(null);
    setVerified(false);
    localStorage.clear();
    navigate("/login");
    setExpanded(false); // Collapse Navbar after logout
  };

  const handleNavigate = (path) => {
    navigate(path);
    setExpanded(false); // Collapse Navbar after navigation
  };

  return (
    <Navbar
      expanded={expanded}
      onToggle={(isExpanded) => setExpanded(isExpanded)} // Sync with Bootstrap's toggle
      expand="lg"
      style={{ backgroundColor: "#312C51" }}
      className="shadow-sm"
    >
      <Container className="d-flex justify-content-center align-items-center">
        <Navbar.Toggle aria-controls="basic-navbar-nav" />
        <Navbar.Collapse id="basic-navbar-nav">
          <Nav
            className="mx-auto d-flex align-items-center justify-content-between gap-5"
            style={{ color: "#F0C38E" }}
          >
            {/* Guest Links */}
            {!userType && !verified && (
              <>
                <Nav.Link
                  as={Link}
                  to="/"
                  className="fw-bold"
                  style={{ color: "#F0C38E" }}
                  onClick={() => setExpanded(false)}
                >
                  Home
                </Nav.Link>
                <Nav.Link
                  as={Link}
                  to="/login"
                  className="fw-bold"
                  style={{ color: "#F0C38E" }}
                  onClick={() => setExpanded(false)}
                >
                  Login
                </Nav.Link>
                <Nav.Link
                  as={Link}
                  to="/register"
                  className="fw-bold"
                  style={{ color: "#F0C38E" }}
                  onClick={() => setExpanded(false)}
                >
                  Register
                </Nav.Link>
              </>
            )}

            {/* Citizen Links */}
            {userType === "Citizen" && verified && (
              <>
                <Nav.Link
                  as={Link}
                  to="/user/home"
                  className="fw-bold"
                  style={{ color: "#F0C38E" }}
                  onClick={() => setExpanded(false)}
                >
                  Home
                </Nav.Link>
                <Nav.Link
                  as={Link}
                  to="/user/services"
                  className="fw-bold"
                  style={{ color: "#F0C38E" }}
                  onClick={() => setExpanded(false)}
                >
                  Apply for Service
                </Nav.Link>
                <NavDropdown
                  title={
                    <span style={{ color: "#F0C38E", fontWeight: "bold" }}>
                      Application Status
                    </span>
                  }
                  id="application-status"
                >
                  <NavDropdown.Item
                    onClick={() => handleNavigate("/user/initiated")}
                  >
                    Initiated Applications
                  </NavDropdown.Item>
                  <NavDropdown.Item
                    onClick={() => handleNavigate("/user/incomplete")}
                  >
                    Incomplete Applications
                  </NavDropdown.Item>
                </NavDropdown>
              </>
            )}

            {/* Officer Links */}
            {userType === "Officer" && verified && (
              <>
                <Nav.Link
                  as={Link}
                  to="/officer/home"
                  className="fw-bold"
                  style={{ color: "#F0C38E" }}
                  onClick={() => setExpanded(false)}
                >
                  Home
                </Nav.Link>
                <Nav.Link
                  as={Link}
                  to="/officer/reports"
                  className="fw-bold"
                  style={{ color: "#F0C38E" }}
                  onClick={() => setExpanded(false)}
                >
                  Reports
                </Nav.Link>
                {designation === "Director Finance" && (
                  <NavDropdown
                    title={
                      <span style={{ color: "#F0C38E", fontWeight: "bold" }}>
                        Manage Bank File
                      </span>
                    }
                    id="manage-bank-file"
                    style={{ color: "#F0C38E" }}
                  >
                    <NavDropdown.Item
                      onClick={() => handleNavigate("/officer/bankFile")}
                    >
                      Create Bank File
                    </NavDropdown.Item>
                    <NavDropdown.Item
                      onClick={() => handleNavigate("/officer/responseFile")}
                    >
                      Check Response File
                    </NavDropdown.Item>
                  </NavDropdown>
                )}
                <NavDropdown
                  title={
                    <span style={{ color: "#F0C38E", fontWeight: "bold" }}>
                      DSC Management
                    </span>
                  }
                  id="dsc-management"
                  style={{ color: "#F0C38E" }}
                >
                  <NavDropdown.Item
                    onClick={() => handleNavigate("/officer/registerDSC")}
                  >
                    Register DSC
                  </NavDropdown.Item>
                  <NavDropdown.Item
                    onClick={() => handleNavigate("/officer/unregisterDSC")}
                  >
                    Unregister DSC
                  </NavDropdown.Item>
                </NavDropdown>
              </>
            )}

            {/* Admin Links */}
            {userType === "Admin" && verified && (
              <>
                <Nav.Link
                  as={Link}
                  to="/admin/home"
                  className="fw-bold"
                  style={{ color: "#F0C38E" }}
                  onClick={() => setExpanded(false)}
                >
                  Dashboard
                </Nav.Link>
                <NavDropdown
                  title="Reports"
                  id="admin-reports"
                  style={{ color: "#F0C38E" }}
                >
                  <NavDropdown.Item
                    onClick={() => handleNavigate("/admin/individual")}
                  >
                    Individual Report
                  </NavDropdown.Item>
                  <NavDropdown.Item
                    onClick={() => handleNavigate("/admin/history")}
                  >
                    History
                  </NavDropdown.Item>
                </NavDropdown>
              </>
            )}
          </Nav>

          {/* User Profile and Logout */}
          {userType && verified && (
            <Nav className="ms-auto d-flex align-items-center">
              <span className="fw-bold" style={{ color: "#F0C38E" }}>
                {username}
              </span>
              <NavDropdown
                title={
                  <img
                    src={profile || "/default-avatar.png"}
                    alt="Profile"
                    className="rounded-circle"
                    style={{ width: "30px" }}
                  />
                }
                id="profile-dropdown"
              >
                <NavDropdown.Item onClick={() => handleNavigate("/settings")}>
                  Settings
                </NavDropdown.Item>
                <NavDropdown.Item onClick={handleLogout}>
                  Logout
                </NavDropdown.Item>
              </NavDropdown>
            </Nav>
          )}
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
};

export default MyNavbar;
