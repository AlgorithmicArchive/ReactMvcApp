import { Box, Button, Tooltip, Collapse } from "@mui/material";
import React from "react";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import ExpandLessIcon from "@mui/icons-material/ExpandLess";
import ServerSideTable from "../ServerSideTable";

const CollapsibleActionHistory = ({
  detailsOpen,
  setDetailsOpen,
  applicationId,
}) => {
  return (
    <Box sx={{ width: "100%", maxWidth: 800, mx: "auto", mb: 4 }}>
      <Box sx={{ display: "flex", justifyContent: "center", mb: 2 }}>
        <Tooltip
          title={detailsOpen ? "Collapse details" : "Expand details"}
          arrow
        >
          <Button
            onClick={() => setDetailsOpen((prev) => !prev)}
            sx={{
              backgroundColor: "primary.main",
              color: "background.paper",
              fontWeight: 600,
              textTransform: "none",
              py: 1,
              px: 3,
              borderRadius: 2,
              "&:hover": {
                backgroundColor: "primary.dark",
                transform: "scale(1.02)",
                transition: "all 0.2s ease",
              },
            }}
            startIcon={detailsOpen ? <ExpandLessIcon /> : <ExpandMoreIcon />}
            aria-expanded={detailsOpen}
            aria-label={detailsOpen ? "Collapse details" : "Expand details"}
          >
            {detailsOpen ? "Collapse" : "Expand"} Details
          </Button>
        </Tooltip>
      </Box>

      <Collapse in={detailsOpen} timeout={500}>
        <ServerSideTable
          url={"/Officer/GetApplicationHistory"}
          extraParams={{ applicationId: applicationId }}
          actionFunctions={{}}
        />
      </Collapse>
    </Box>
  );
};

export default CollapsibleActionHistory;
