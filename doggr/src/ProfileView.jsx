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
    <div className="SHRINK">
      <div className="Whole_ShowMessages">
        <div className="DogImageCard_ShowProfile">
          <img src={picture1} id="MainDogImage_ShowProfile" alt="Dog 1" />
          <div className="SmallDogImageGrid_MainPage">
            <img
              src={picture2}
              className="SmallDogImage_ShowProfile"
              alt="Dog 2"
            />
            <img
              src={picture3}
              className="SmallDogImage_ShowProfile"
              alt="Dog 3"
            />
            <img
              src={picture4}
              className="SmallDogImage_ShowProfile"
              alt="Dog 4"
            />
            <img
              src={picture5}
              className="SmallDogImage_ShowProfile"
              alt="Dog 5"
            />
          </div>
        </div>

        <div className="BioCard_ShowProfile">
          <h1 className="Header_ShowProfile">{dog_name}</h1>
          <p className="Paragraph_ShowProfile">{bio}</p>
        </div>

        <div className="Levels_ShowProfile">
          <div className="profile-container">
            {renderLevelBar("Size", size)}
            {renderLevelBar("Training", training)}
            {renderLevelBar("Likeability", likeability)}
            {renderLevelBar("Energy", energy)}
            {renderLevelBar("Playfulness", playfulness)}
            {renderLevelBar("Aggression", aggression)}
          </div>
        </div>
      </div>
    </div>
  );
}

export default ProfileView;
