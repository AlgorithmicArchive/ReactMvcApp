import React, { useContext, useState, useEffect } from "react";
import { Navbar, Nav, NavDropdown, Container } from "react-bootstrap";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { UserContext } from "../UserContext";

const MyNavbar = () => {
  const [expanded, setExpanded] = useState(false);
  const [hoveredItem, setHoveredItem] = useState(null);
  const [isSmallScreen, setIsSmallScreen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
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

  // Detect screen size to toggle hover behavior
  useEffect(() => {
    const handleResize = () => {
      setIsSmallScreen(window.innerWidth < 992); // Bootstrap's lg breakpoint
    };
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const handleLogout = () => {
    setToken(null);
    setUserType(null);
    setUsername(null);
    setProfile(null);
    setVerified(false);
    localStorage.clear();
    navigate("/login");
    setExpanded(false);
  };

  const handleNavigate = (path) => {
    navigate(path);
    setExpanded(false);
  };

  const handleMouseEnter = (itemName) => {
    if (!isSmallScreen) setHoveredItem(itemName); // Only for large screens
  };

  const handleMouseLeave = () => {
    if (!isSmallScreen) setHoveredItem(null); // Only for large screens
  };

  const getNavItemStyle = (itemName, path = null) => {
    const isActive = path ? location.pathname === path : false;
    const isHovered = hoveredItem === itemName;

    return {
      color: isHovered || isActive ? "#333333" : "#333333",
      fontWeight: isHovered || isActive ? 600 : "normal",
      padding: "5px 15px",
      transition: "all 0.3s ease",
    };
  };

  return (
    <Navbar
      expanded={expanded}
      onToggle={(isExpanded) => setExpanded(isExpanded)}
      expand="lg"
      style={{ backgroundColor: "#FFFFFF" }}
    >
      <Container>
        {/* Logo Section */}
        <Navbar.Brand as={Link} to="/" className="me-4">
          <div className="me-5 d-flex align-items-center">
            <img
              src="/assets/images/logo.png"
              alt="Website Logo"
              height="40"
              className="d-inline-block align-top"
            />
            <span className="ms-2 fw-bold" style={{ color: "#333333" }}>
              YourSiteName
            </span>
          </div>
        </Navbar.Brand>

        <Navbar.Toggle aria-controls="basic-navbar-nav" />
        <Navbar.Collapse id="basic-navbar-nav">
          {/* Main Navigation */}
          <Nav
            className="ms-5 d-flex align-items-center gap-3"
            style={{ color: "#333333" }}
          >
            {!userType && !verified && (
              <>
                <Nav.Link
                  as={Link}
                  to="/"
                  style={getNavItemStyle("home", "/")}
                  onClick={() => setExpanded(false)}
                  onMouseEnter={() => handleMouseEnter("home")}
                  onMouseLeave={handleMouseLeave}
                >
                  Home
                </Nav.Link>
                <Nav.Link
                  as={Link}
                  to="/login"
                  style={getNavItemStyle("login", "/login")}
                  onClick={() => setExpanded(false)}
                  onMouseEnter={() => handleMouseEnter("login")}
                  onMouseLeave={handleMouseLeave}
                >
                  Login
                </Nav.Link>
                <Nav.Link
                  as={Link}
                  to="/register"
                  style={getNavItemStyle("register", "/register")}
                  onClick={() => setExpanded(false)}
                  onMouseEnter={() => handleMouseEnter("register")}
                  onMouseLeave={handleMouseLeave}
                >
                  Register
                </Nav.Link>
              </>
            )}

            {userType === "Citizen" && verified && (
              <>
                <Nav.Link
                  as={Link}
                  to="/user/home"
                  style={getNavItemStyle("citizen-home", "/user/home")}
                  onClick={() => setExpanded(false)}
                  onMouseEnter={() => handleMouseEnter("citizen-home")}
                  onMouseLeave={handleMouseLeave}
                >
                  Home
                </Nav.Link>
                <Nav.Link
                  as={Link}
                  to="/user/services"
                  style={getNavItemStyle("apply-service", "/user/services")}
                  onClick={() => setExpanded(false)}
                  onMouseEnter={() => handleMouseEnter("apply-service")}
                  onMouseLeave={handleMouseLeave}
                >
                  Apply for Service
                </Nav.Link>
                <div
                  onMouseEnter={() => handleMouseEnter("application-status")}
                  onMouseLeave={handleMouseLeave}
                >
                  <NavDropdown
                    title={
                      <span style={getNavItemStyle("application-status")}>
                        Application Status
                      </span>
                    }
                    id="application-status"
                    show={
                      isSmallScreen
                        ? undefined
                        : hoveredItem === "application-status"
                    } // Disable show on small screens
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
                </div>
              </>
            )}

            {userType === "Officer" && verified && (
              <>
                <Nav.Link
                  as={Link}
                  to="/officer/home"
                  style={getNavItemStyle("officer-home", "/officer/home")}
                  onClick={() => setExpanded(false)}
                  onMouseEnter={() => handleMouseEnter("officer-home")}
                  onMouseLeave={handleMouseLeave}
                >
                  Home
                </Nav.Link>
                <Nav.Link
                  as={Link}
                  to="/officer/reports"
                  style={getNavItemStyle("officer-reports", "/officer/reports")}
                  onClick={() => setExpanded(false)}
                  onMouseEnter={() => handleMouseEnter("officer-reports")}
                  onMouseLeave={handleMouseLeave}
                >
                  Reports
                </Nav.Link>

                {designation === "Director Finance" && (
                  <div
                    onMouseEnter={() => handleMouseEnter("bank-file")}
                    onMouseLeave={handleMouseLeave}
                  >
                    <NavDropdown
                      title={
                        <span style={getNavItemStyle("bank-file")}>
                          Manage Bank File
                        </span>
                      }
                      id="manage-bank-file"
                      show={
                        isSmallScreen ? undefined : hoveredItem === "bank-file"
                      }
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
                  </div>
                )}

                <div
                  onMouseEnter={() => handleMouseEnter("dsc-management")}
                  onMouseLeave={handleMouseLeave}
                >
                  <NavDropdown
                    title={
                      <span style={getNavItemStyle("dsc-management")}>
                        DSC Management
                      </span>
                    }
                    id="dsc-management"
                    show={
                      isSmallScreen
                        ? undefined
                        : hoveredItem === "dsc-management"
                    }
                  >
                    <NavDropdown.Item
                      onClick={() => handleNavigate("/officer/registerdsc")}
                    >
                      Register DSC
                    </NavDropdown.Item>
                    <NavDropdown.Item
                      onClick={() => handleNavigate("/officer/unregisterDSC")}
                    >
                      Register DSC
                    </NavDropdown.Item>
                  </NavDropdown>
                </div>
              </>
            )}

            {userType === "Admin" && verified && (
              <>
                <Nav.Link
                  as={Link}
                  to="/admin/home"
                  style={getNavItemStyle("admin-home", "/admin/home")}
                  onClick={() => setExpanded(false)}
                  onMouseEnter={() => handleMouseEnter("admin-home")}
                  onMouseLeave={handleMouseLeave}
                >
                  Dashboard
                </Nav.Link>

                <div
                  onMouseEnter={() => handleMouseEnter("admin-reports")}
                  onMouseLeave={handleMouseLeave}
                >
                  <NavDropdown
                    title={
                      <span style={getNavItemStyle("admin-reports")}>
                        Reports
                      </span>
                    }
                    id="admin-reports"
                    show={
                      isSmallScreen
                        ? undefined
                        : hoveredItem === "admin-reports"
                    }
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
                </div>
              </>
            )}

            {userType === "Designer" && verified && (
              <>
                <Nav.Link
                  as={Link}
                  to="/designer/dashboard"
                  style={getNavItemStyle(
                    "designer-dashboard",
                    "/designer/dashboard"
                  )}
                  onClick={() => setExpanded(false)}
                  onMouseEnter={() => handleMouseEnter("designer-dashboard")}
                  onMouseLeave={handleMouseLeave}
                >
                  Dashboard
                </Nav.Link>
                <Nav.Link
                  as={Link}
                  to="/designer/dynamicform"
                  style={getNavItemStyle(
                    "dynamic-form",
                    "/designer/dynamicform"
                  )}
                  onClick={() => setExpanded(false)}
                  onMouseEnter={() => handleMouseEnter("dynamic-form")}
                  onMouseLeave={handleMouseLeave}
                >
                  Dynamic Form
                </Nav.Link>

                <div
                  onMouseEnter={() => handleMouseEnter("designer-create")}
                  onMouseLeave={handleMouseLeave}
                >
                  <NavDropdown
                    title={
                      <span style={getNavItemStyle("designer-create")}>
                        Create/Update
                      </span>
                    }
                    id="designer-create"
                    show={
                      isSmallScreen
                        ? undefined
                        : hoveredItem === "designer-create"
                    }
                  >
                    <NavDropdown.Item
                      onClick={() => handleNavigate("/designer/createservice")}
                    >
                      Service
                    </NavDropdown.Item>
                    <NavDropdown.Item
                      onClick={() => handleNavigate("/designer/createworkflow")}
                    >
                      Workflow
                    </NavDropdown.Item>
                    <NavDropdown.Item
                      onClick={() =>
                        handleNavigate("/designer/createletterpdf")
                      }
                    >
                      Letter Pdf
                    </NavDropdown.Item>
                  </NavDropdown>
                </div>
              </>
            )}
          </Nav>

          {userType && verified && (
            <Nav className="ms-auto d-flex align-items-center">
              <span style={{ color: "#333333" }}>{username}</span>

              <div
                onMouseEnter={() => handleMouseEnter("profile")}
                onMouseLeave={handleMouseLeave}
              >
                <NavDropdown
                  title={
                    <img
                      src={profile || "/assets/images/profile.jpg"}
                      alt="Profile"
                      className="rounded-circle"
                      style={{ width: "30px" }}
                    />
                  }
                  id="profile-dropdown"
                  show={isSmallScreen ? undefined : hoveredItem === "profile"}
                >
                  <NavDropdown.Item onClick={() => handleNavigate("/settings")}>
                    Settings
                  </NavDropdown.Item>
                  <NavDropdown.Item onClick={handleLogout}>
                    Logout
                  </NavDropdown.Item>
                </NavDropdown>
              </div>
            </Nav>
          )}
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
};

export default MyNavbar;
