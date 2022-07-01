import React, { useState } from 'react';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import IconButton from '@mui/material/IconButton';
import FavoriteIcon from '@mui/icons-material/Favorite';
import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import CardActionArea from '@mui/material/CardActionArea';
import Stack from '@mui/material/Stack';
import CardActions from '@mui/material/CardActions';
import theme from 'theme/theme';
import useCalendar from 'context/calendar';
import CompareIcon from '@mui/icons-material/Compare';
import TextField from '@mui/material/TextField';
import CheckIcon from '@mui/icons-material/Check';
import { StyledPopover } from 'navbar/NavbarMenu';
import EditIcon from '@mui/icons-material/Edit';
import useSocket from 'context/socket';
import { updateFavTimetable } from 'calendar/api/sideMenuApi';
import EventNoteIcon from '@mui/icons-material/EventNote';
import NavbarTooltip from 'navbar/NavbarTooltip';
import Button from '@mui/material/Button';

export default function TimetableCard({
  timetableIndex,
  tb,
  handleAddFavourite = null,
  favTimetable = null,
  getMatchTimetable = null,
  setTimetableIndex,
  index,
  isSaved = false,
  isAuthor = true,
  setTab = null,
}) {
  const {
    setCurrentSelectedTimetable,
    userFriend,
    setView,
    timetablesCompare,
    setTimetablesCompare,
  } = useCalendar();
  const [anchorEl, setAnchorEl] = useState(null);
  const [anchorElB, setAnchorElB] = useState(null);
  const [currentFriend, setCurrentFriend] = useState();
  const { socket } = useSocket();
  const [isEditing, setIsEditing] = useState(false);
  const [nameValue, setNameValue] = useState(tb.name || 'Name this timetable');
  const open = Boolean(anchorEl);
  const openB = Boolean(anchorElB);

  const termToString = {
    F: 'Fall',
    S: 'Winter',
  };

  const handleSaveName = () => {
    tb.name = nameValue;
    updateFavTimetable(socket, tb);
    setIsEditing(false);
  };

  return (
    <Box
      sx={{
        transition: (theme) =>
          theme.transitions.create(['border', 'transform'], {
            easing: theme.transitions.easing.easeInOut,
            duration: 200,
          }),
        ':hover': {
          transform: 'scale(1.05)',
        },
      }}
    >
      <Card
        sx={{
          pb: !favTimetable && 2,
          my: 2,
          py: 1,
          color: 'white',
          backgroundColor: theme.palette.primary.main,
          // border:
          //   timetableIndex === index ? '3px solid #576066' : '3px solid black',
          transform: timetableIndex === index ? 'scale(1.05)' : 'scale(0.95)',
          transition: (theme) =>
            theme.transitions.create(['border', 'transform'], {
              easing: theme.transitions.easing.easeInOut,
              duration: 200,
            }),
        }}
        key={index}
      >
        <Stack direction={'row'} justifyContent={'space-between'}>
          {isAuthor && isSaved && (
            <>
              <TextField
                disabled={!isEditing}
                placeholder="Name this timetable"
                onChange={(e) => setNameValue(e.target.value)}
                value={nameValue}
                sx={{
                  ml: 0.5,
                  '& .MuiOutlinedInput-input': {
                    color: 'white !important',
                  },
                  '& .Mui-disabled': {
                    WebkitTextFillColor: 'white !important',
                    opacity: 1,
                  },
                }}
              />
              {isEditing ? (
                <IconButton onClick={() => handleSaveName()}>
                  <CheckIcon sx={{ color: 'white' }} />
                </IconButton>
              ) : (
                <IconButton onClick={() => setIsEditing(!isEditing)}>
                  <EditIcon sx={{ color: 'white' }} />
                </IconButton>
              )}
            </>
          )}
          <Typography
            sx={{
              display: 'flex',
              alignItems: 'center',
              ml: 'auto',
              mr: 2,
            }}
          >
            {termToString[tb.term]}
          </Typography>
        </Stack>
        <CardActionArea
          onClick={() => {
            setTimetableIndex(index);
          }}
        >
          <CardContent sx={{ pt: 1, pb: 0 }}>
            <Box>
              {tb.timetable.map((course) => (
                <Box key={course.courseCode} sx={{ textAlign: 'start' }}>
                  <Stack direction={'row'}>
                    <Typography sx={{}}>{course.courseCode}</Typography>
                    <Typography sx={{ ml: 'auto' }}>
                      {course.section.sectionCode}
                    </Typography>
                    <Typography>{course.tutorial}</Typography>
                  </Stack>
                </Box>
              ))}
            </Box>
          </CardContent>
        </CardActionArea>

        {isAuthor && (
          <CardActions sx={{ my: 0, py: 0 }}>
            {/* <NavbarTooltip title={<Typography>Unlike</Typography>}> */}
            <IconButton onClick={() => handleAddFavourite(tb)}>
              {favTimetable && getMatchTimetable(tb.timetable) ? (
                <FavoriteIcon sx={{ color: 'white' }} />
              ) : (
                <FavoriteBorderIcon sx={{ color: 'white' }} />
              )}
            </IconButton>
            {/* </NavbarTooltip> */}
            <NavbarTooltip
              title={
                <Typography>Compare this timetable with a friend</Typography>
              }
            >
              <IconButton
                onClick={(e) => {
                  setAnchorEl(e.currentTarget);
                  setCurrentSelectedTimetable(tb);
                }}
              >
                <CompareIcon sx={{ color: 'white' }} />
              </IconButton>
            </NavbarTooltip>
            <StyledPopover
              sx={{
                '& .MuiPopover-paper': {
                  backgroundColor: 'gray',
                },
              }}
              open={open}
              anchorEl={anchorEl}
              onClose={() => setAnchorEl(null)}
              anchorOrigin={{
                vertical: 'bottom',
                horizontal: 'center',
              }}
            >
              <Box sx={{ p: 2 }}>
                <strong>
                  <Typography>Compare With a Friend</Typography>
                </strong>
                {userFriend ? (
                  userFriend.map((friend) => (
                    <Box key={friend._id} sx={{ my: 1 }}>
                      <Button
                        sx={{
                          width: '100%',
                          color: 'white',
                          justifyContent: 'start',
                        }}
                        onClick={(e) => {
                          setCurrentFriend(friend._id);
                          setAnchorElB(e.currentTarget);
                        }}
                      >
                        <Typography>{`${friend.first} ${friend.last}`}</Typography>
                      </Button>
                      {friend._id === currentFriend && (
                        <StyledPopover
                          sx={{
                            '& .MuiPopover-paper': {
                              backgroundColor: 'gray',
                            },
                          }}
                          open={openB}
                          anchorEl={anchorElB}
                          onClose={() => {
                            setCurrentFriend(null);
                            setAnchorElB(null);
                          }}
                          anchorOrigin={{
                            vertical: 'bottom',
                            horizontal: 'right',
                          }}
                        >
                          <Box sx={{ p: 2 }}>
                            {friend.favoritedTimetables?.length > 0 ? (
                              friend.favoritedTimetables.map(
                                (friendTimetable) => (
                                  <Box key={friendTimetable._id} sx={{ my: 1 }}>
                                    <Button
                                      sx={{
                                        width: '100%',
                                        color: 'white',
                                        justifyContent: 'start',
                                      }}
                                      onClick={() => {
                                        console.log(timetablesCompare);
                                        setTimetablesCompare([
                                          ...timetablesCompare,
                                          {
                                            owner: `${friend.first} ${friend.last}`,
                                            timetable:
                                              friendTimetable.timetable,
                                          },
                                        ]);
                                      }}
                                    >
                                      <Typography>
                                        {`${friendTimetable.name}-${
                                          termToString[friendTimetable.term]
                                        }`}
                                      </Typography>
                                    </Button>
                                  </Box>
                                )
                              )
                            ) : (
                              <Typography>No Timetables</Typography>
                            )}
                          </Box>
                        </StyledPopover>
                      )}
                    </Box>
                  ))
                ) : (
                  <Typography>Your friends will show up here</Typography>
                )}
              </Box>
            </StyledPopover>
            <NavbarTooltip title={<Typography>Edit timetable</Typography>}>
              <IconButton
                onClick={(e) => {
                  // navigate to edit timetable page
                  setCurrentSelectedTimetable(tb);
                  setTab(0);
                  setView('edit');
                }}
              >
                <EventNoteIcon
                  sx={{ color: theme.palette.primary.contrastText }}
                />
              </IconButton>
            </NavbarTooltip>
          </CardActions>
        )}
      </Card>
    </Box>
  );
}
