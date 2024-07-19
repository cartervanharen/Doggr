import { Box, Typography, LinearProgress } from "@mui/material";

function ProfileView({ userData }) {
  const renderLevelBar = (label, value) => {
    return (
      <Box sx={{ mb: 1 }}>
        <Box sx={{ display: "flex", justifyContent: "space-between", mb: 1 }}>
          <Typography variant="body2" color="textSecondary">
            {label}
          </Typography>
          <Typography variant="body2" color="textSecondary">
            {value}
          </Typography>
        </Box>
        <LinearProgress
          sx={{ height: 10, borderRadius: 5 }}
          variant="determinate"
          value={(value / 10) * 100}
        />
      </Box>
    );
  };

  if (!userData) return null;

  const {
    basic: { human_first_name, human_last_name, dog_name, address },
    userdata: {
      bio,
      likeability,
      energy,
      playfulness,
      aggression,
      size,
      training,
    },
    pictures: { picture1, picture2, picture3, picture4, picture5 },
  } = userData;

  return (
    <Box sx={{ padding: 2 }}>
      <Box className="DogImageCard_ShowProfile">
        <img
          src={picture1}
          id="MainDogImage_ShowProfile"
          alt="Dog 1"
          style={{ width: "100%", borderRadius: 8 }}
        />
        <Box
          className="SmallDogImageGrid_MainPage"
          sx={{ display: "flex", justifyContent: "space-between", mt: 2 }}
        >
          <img
            src={picture2}
            className="SmallDogImage_ShowProfile"
            alt="Dog 2"
            style={{ width: "18%", borderRadius: 8 }}
          />
          <img
            src={picture3}
            className="SmallDogImage_ShowProfile"
            alt="Dog 3"
            style={{ width: "18%", borderRadius: 8 }}
          />
          <img
            src={picture4}
            className="SmallDogImage_ShowProfile"
            alt="Dog 4"
            style={{ width: "18%", borderRadius: 8 }}
          />
          <img
            src={picture5}
            className="SmallDogImage_ShowProfile"
            alt="Dog 5"
            style={{ width: "18%", borderRadius: 8 }}
          />
        </Box>
      </Box>

      <Box className="BioCard_ShowProfile" sx={{ mt: 2 }}>
        <Typography variant="h5" className="Header_ShowProfile">
          {dog_name}
        </Typography>
        <Typography variant="body1" className="Paragraph_ShowProfile">
          {bio}
        </Typography>
      </Box>

      <Box className="Levels_ShowProfile" sx={{ mt: 2 }}>
        <div className="profile-container">
          {renderLevelBar("Size", size)}
          {renderLevelBar("Training", training)}
          {renderLevelBar("Likeability", likeability)}
          {renderLevelBar("Energy", energy)}
          {renderLevelBar("Playfulness", playfulness)}
          {renderLevelBar("Aggression", aggression)}
        </div>
      </Box>
    </Box>
  );
}

export default ProfileView;
