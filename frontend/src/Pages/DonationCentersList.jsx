import { useEffect, useState } from "react";
import axios from "axios";
import {
  Grid,
  Card,
  CardContent,
  Typography,
  Box,
  CircularProgress,
  CardActionArea,
} from "@mui/material";
import LocationOnIcon from "@mui/icons-material/LocationOn";
import PhoneIcon from "@mui/icons-material/Phone";
import HomeWorkIcon from "@mui/icons-material/HomeWork";
import { useNavigate } from "react-router-dom";
import DonationRequestForm from "../components/DonationRequestForm";

const DonationCentersList = () => {
  const [centers, setCenters] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
     const [selectedCenter, setSelectedCenter] = useState(null);
  useEffect(() => {
    const fetchCenters = async () => {
      try {
        const res = await axios.get("http://localhost:4000/api/v1/donation/centers", {
  withCredentials: true
});

        console.log(res)
        setCenters(res.data.centers || []);
      } catch (error) {
        console.error("Error fetching donation centers", error);
      }
      setLoading(false);
    };
    fetchCenters();
  }, []);

  const handleCenterClick = (centerId) => {
    // Redirect to blood donation request form with centerId in query params
     setSelectedCenter(centerId);
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" mt={5}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <>
    <Box sx={{ p: 10}}>
      <Typography variant="h4" fontWeight="bold" gutterBottom textAlign="center">
        Donation Centers
      </Typography>
      <Grid container spacing={2}>
        {centers.map((center) => (
          <Grid item xs={12} sm={6} md={4} key={center._id}>
            <Card
              elevation={4}
              sx={{
                borderRadius: 3,
                transition: "0.3s",
                "&:hover": { transform: "scale(1.03)", boxShadow: 6 },
              }}
            >
              <CardActionArea onClick={() => handleCenterClick(center._id)}>
                <CardContent>
                  <Box display="flex" alignItems="center" mb={1}>
                    <HomeWorkIcon color="primary" sx={{ mr: 1 }} />
                    <Typography variant="h6" fontWeight="bold">
                      {center.name}
                    </Typography>
                  </Box>
                  <Box display="flex" alignItems="center">
                    <LocationOnIcon sx={{ mr: 1, color: "text.secondary" }} />
                    <Typography variant="body2" color="text.secondary">
                      {center.city}
                    </Typography>
                  </Box>
                  <Typography variant="body2" color="text.secondary" sx={{ ml: 4 }}>
                    {center.address}
                  </Typography>
                  <Box display="flex" alignItems="center" mt={1}>
                    <PhoneIcon sx={{ mr: 1, color: "text.secondary" }} />
                    <Typography variant="body2">{center.contactNumber}</Typography>
                  </Box>
                </CardContent>
              </CardActionArea>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Box>
     <DonationRequestForm
        open={!!selectedCenter}
        onClose={() => setSelectedCenter(null)}
        centerId={selectedCenter}
      />
      </>
  );
};

export default DonationCentersList;
