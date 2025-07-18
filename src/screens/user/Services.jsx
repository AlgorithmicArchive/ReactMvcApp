import React, { useState } from "react";
import { Box, Typography } from "@mui/material";
import { useNavigate } from "react-router-dom";
import styled from "@emotion/styled";
import ServerSideTable from "../../components/ServerSideTable";
import LoadingSpinner from "../../components/LoadingSpinner";
import { fetchData, SetServiceId } from "../../assets/fetch";

const MainContainer = styled(Box)`
  min-height: 100vh;
  background: linear-gradient(180deg, #e6f0fa 0%, #b3cde0 100%);
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 2rem;
`;

const TableCard = styled(Box)`
  background: #ffffff;
  border-radius: 16px;
  padding: 2rem;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.1);
  width: 90%;
  transition: transform 0.3s ease, box-shadow 0.3s ease;
  &:hover {
    transform: translateY(-4px);
    box-shadow: 0 12px 32px rgba(0, 0, 0, 0.15);
  }
`;

export default function Services() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const actionFunctions = {
    OpenForm: (row) => {
      const userdata = row.original;
      navigate("/user/form", { state: { ServiceId: userdata.serviceId } });
    },
  };

  if (loading) {
    return (
      <MainContainer>
        <LoadingSpinner />
      </MainContainer>
    );
  }

  return (
    <MainContainer>
      <TableCard>
        <ServerSideTable
          url="User/GetServices"
          extraParams={{}}
          actionFunctions={actionFunctions}
          Title={"Available Services"}
        />
      </TableCard>
    </MainContainer>
  );
}
