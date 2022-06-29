import React, { useEffect, useState, useRef } from 'react';
import courseData from '../data/course_and_title.json';
import Autocomplete from '@mui/material/Autocomplete';
import TextField from '@mui/material/TextField';
import { createFilterOptions } from '@mui/material/Autocomplete';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import Container from '@mui/material/Container';
import FormControlLabel from '@mui/material/FormControlLabel';
import FormLabel from '@mui/material/FormLabel';
import FormGroup from '@mui/material/FormGroup';
import Radio from '@mui/material/Radio';
import LoadingButton from '@mui/lab/LoadingButton';
import RadioGroup from '@mui/material/RadioGroup';
import useSocket from 'context/socket';
import {
  getCourse,
  addUserCourse,
  generateTimeTable,
  makeNewTimetable,
} from 'calendar/api/sideMenuApi';
import useFeedback from 'context/feedback';
import useCalendar from 'context/calendar';

export default function SearchBar({ userCourse }) {
  const [input, setInput] = useState({
    courseCode: '',
    university: 'uoft',
    term: 'F',
  });
  const [searchData, setSearchData] = useState(undefined);
  const [isLoading, setIsLoading] = useState(false);
  const [btnIsLoading, setBtnIsLoading] = useState();
  const { socket } = useSocket();
  const bottomRef = useRef();
  const { setMsg } = useFeedback();
  const { setView } = useCalendar();

  const filterOptions = createFilterOptions({
    limit: 15,
    ignoreCase: true,
  });

  const terms = ['F', 'S', 'Y'];

  useEffect(() => {
    if (input.courseCode && input.term && input.university) {
      setIsLoading(true);
      setSearchData(undefined);
      getCourse({
        courseCode: input.courseCode.slice(0, 8),
        university: input.university,
        term: input.term,
      }).then((data) => {
        setSearchData(data);
        setIsLoading(false);
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [input]);

  useEffect(() => {
    setBtnIsLoading(null);
  }, [userCourse]);

  useEffect(() => {
    socket.on('get build timetable', () => {
      setBtnIsLoading(null);
    });
    return () => {
      socket.off('get build course');
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    socket.on('get generated timetable', () => {
      setBtnIsLoading(null);
    });
    return () => {
      socket.off('get generated course');
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleInputChange = (option, v) => {
    if (option === 'code') {
      setInput({
        ...input,
        courseCode: v,
      });
    } else if (option === 'term') {
      setInput({
        ...input,
        term: v,
      });
    } else {
      setInput({
        ...input,
        university: v,
      });
    }
  };

  const handleAddCourse = () => {
    setBtnIsLoading('add');
    console.log(searchData[0]);
    addUserCourse(socket, searchData[0]);
  };

  const handleSubmit = (cb, type) => {
    setBtnIsLoading(type);
    if (userCourse.length > 0) {
      cb(socket, userCourse);
    } else {
      setMsg({
        snackVariant: 'info',
        msg: 'Please Choose a Course First!',
      });
      setBtnIsLoading(null);
    }
  };

  return (
    <>
      <FormGroup sx={{ mb: 1 }}>
        <FormLabel id="search-label" sx={{ textAlign: 'left', mb: 2 }}>
          Search Course
        </FormLabel>
        <Autocomplete
          sx={{ mb: 2 }}
          disablePortal
          id="search-course"
          options={courseData}
          filterOptions={filterOptions}
          onChange={(e, v) => handleInputChange('code', v)}
          renderInput={(params) => (
            <TextField {...params} label="Search Course" />
          )}
        />
        <FormLabel id="term-label" sx={{ textAlign: 'left' }}>
          Term
        </FormLabel>
        <RadioGroup
          row
          sx={{ mx: 1 }}
          value={input.term}
          onChange={(e) => handleInputChange('term', e.target.value)}
        >
          {terms.map((t) => (
            <FormControlLabel
              key={t}
              value={t}
              control={<Radio size="small" />}
              label={t}
            />
          ))}
        </RadioGroup>
      </FormGroup>

      {searchData === undefined ? (
        isLoading ? (
          <>
            <Container sx={{ transform: 'scale(0.6)' }}>
              <img
                alt={'Loading'}
                className="ld ld-bounce"
                style={{ animationDuration: '1s' }}
                src="./calendar-loader.png"
              />
            </Container>
          </>
        ) : null
      ) : (
        <Box sx={{ overflow: 'auto', mb: 2 }}>
          {searchData.length === 0 ? (
            <Typography align="center">
              No Course With Matching Name And Term
            </Typography>
          ) : (
            <>
              <Typography>Course</Typography>
              <Box sx={{ display: 'flex', m: 1 }}>
                <Typography variant="h6">
                  {searchData[0].courseTitle}
                </Typography>
                <LoadingButton
                  loading={btnIsLoading === 'add'}
                  variant="contained"
                  sx={{ ml: 'auto' }}
                  onClick={() => handleAddCourse()}
                >
                  Add this course
                </LoadingButton>
              </Box>
            </>
          )}
        </Box>
      )}
      <div ref={bottomRef}></div>

      <LoadingButton
        loading={btnIsLoading === 'build'}
        sx={{ display: 'block', mb: 1 }}
        onClick={() => handleSubmit(makeNewTimetable, 'build')}
        variant={'contained'}
      >
        <Typography>Choose Sections</Typography>
      </LoadingButton>

      <LoadingButton
        loading={btnIsLoading === 'generate'}
        sx={{ ml: 'auto' }}
        onClick={() => handleSubmit(generateTimeTable, 'generate')}
        variant={'contained'}
      >
        <Typography>Generate Timetables</Typography>
      </LoadingButton>
    </>
  );
}
