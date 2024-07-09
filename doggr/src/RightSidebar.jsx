import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";

function RightSidebar() {
  return (
    <Box
      sx={{
        width: 300,
        height: "100vh",
        position: "fixed",
        top: 0,
        right: 0,
        bgcolor: "background.paper",
        boxShadow: 1,
        padding: 2,
      }}
    >
      <Typography variant="h6" gutterBottom component="div">
        Messages
      </Typography>
      <Typography>Placeholder for messages</Typography>
    </Box>
  );
}

export default RightSidebar;
