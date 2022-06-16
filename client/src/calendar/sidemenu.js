import React, { useEffect, useState } from 'react'
import courseData from './data/course_and_title.json'
import Button from '@mui/material/Button'
import Autocomplete from '@mui/material/Autocomplete'
import TextField from '@mui/material/TextField'
import { createFilterOptions } from '@mui/material/Autocomplete'
import Typography from '@mui/material/Typography'
import List from '@mui/material/List'
import ListItem from '@mui/material/ListItem'
import Box from '@mui/material/Box'
import Container from '@mui/material/Container'
import FormControlLabel from '@mui/material/FormControlLabel'
import Checkbox from '@mui/material/Checkbox'
import FormLabel from '@mui/material/FormLabel'
import FormGroup from '@mui/material/FormGroup'
import Radio from '@mui/material/Radio'
import Divider from '@mui/material/Divider'
import RadioGroup from '@mui/material/RadioGroup'
import LockIcon from '@mui/icons-material/Lock';
import LockOpenIcon from '@mui/icons-material/LockOpen';
import IconButton from '@mui/material/IconButton';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import ExpandLess from '@mui/icons-material/ExpandLess';
import ExpandMore from '@mui/icons-material/ExpandMore';
import Collapse from '@mui/material/Collapse';
import useAuth from '../context/Auth'

// const demo = [
//     { code: 'csc110', name: 'foundation of cs', index: 1, select: true, open: true, attendance: [{ index: 3, select: true, code: 'tut100' }, { index: 2, select: false, code: 'lec100' }] },
//     { code: 'csc111', name: 'foundation of cs2', index: 2, select: false, open: true, attendance: [{ index: 1, select: true, code: 'tut100' }, { index: 2, select: false, code: 'lec100' }] },
//     { code: 'csc1111', name: 'foundation of cs', index: 5, select: false, open: true, attendance: [{ index: 3, select: true, code: 'tut100' }, { index: 2, select: false, code: 'lec100' }] },
//     { code: 'mat223', name: 'linear algebra', index: 4, select: false, open: true, attendance: [{ index: 1, select: true, code: 'tut100' }, { index: 2, select: false, code: 'lec100' }] },
//     { code: 'mat137', name: 'calculus with proof', index: 3, select: true, open: true, attendance: [{ index: 1, select: false, code: 'tut222' }, { index: 2, select: true, code: 'lec601' }] }
// ]

// users/courses/lockCourse - lock/unlock a course
// users/course // 
// from search bars/new - adds a new course to the user
// users/courses/saveCourseHolder - saves a course with no content
// users/courses/delete - delets a coures
// users/courses - gets a course a coures
// users/courses - gets a course

// 1. search for a course add a course 
// get actual value of what the user typed - get the first 8 characters, which is the course code
// button has to call a handle click
// if a user chooses a lecture section and tutorial and saves, send to request to /users/courses/new
// with a courseWithOneSection as request body
// if the user only wants to automatically generate the time, send a request to /users/courses/saveCourseHolder
// with request body including coursecode, university and term

// 

const SideMenu = ({ open, setOpenEdit }) => {
    const { user, setUser } = useAuth()
    // const [userData, setUserData] = useState(demo) // whole thing is demo
    const [edit, setEdit] = useState(false)
    const [isChangingCourse, setIsChangingCourse] = useState(false)

    const handleChangingCourse = () => {
        setIsChangingCourse(true)
    }

    useEffect(() => {
        if (user) {
            fetch('users', { method: 'GET' })
                .then(res => res.json())
                .then(user => {
                    if (!user.err) {
                        setUser(user)
                        setIsChangingCourse(false)
                        console.log(user)
                    }
                })
        }
    }, [isChangingCourse])

    function Editing() {
        return (
            <>
                <p>editing</p>
                {/* display edit screen uwu */}
            </>
        )
    }

    return (

        <Box mt={2} sx={{ overflow: 'auto' }}>
            {edit
                ? <Editing />
                :
                <>
                    <Typography
                        variant='h5'
                        sx={{ display: 'flex', justifyContent: 'start', marginLeft: 3 }}>
                        Your Courses
                    </Typography>
                    {
                        user && <UserCourses user={user}
                            handleChangingCourse={handleChangingCourse} />
                    }
                    <SearchBar handleChangingCourse={handleChangingCourse} />
                </>
            }
            <button onClick={() => setOpenEdit(!open)}>
                click to edit or end edit
            </button>
        </Box>
    )
}

function UserCourses({ user, handleChangingCourse }) {
    const [courseCodeShow, setCourseCodeShow] = useState([])

    const handleCourseOperations = (option, courseCode, type) => {
        fetch(`users/courses/${option}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ type: type, courseCode: courseCode })
        })
            .then(res => res.json())
            .then(data => {
                if (data.success) {
                    handleChangingCourse(true)
                }
            })
    }

    const handleCourseCollapse = (courseCode) => {
        courseCodeShow.includes(courseCode)
            ? setCourseCodeShow([...courseCodeShow.filter(c => c !== courseCode)])
            : setCourseCodeShow([...courseCodeShow, courseCode])
    }

    return (
        <List sx={{ maxHeight: 300, overflow: 'auto' }}>
            {user.courses.map((course, i) =>
                <Box key={course.courseCode}>
                    <ListItem key={course.courseCode} sx={{ flexDirection: 'column', alignItems: 'baseline', pt: 0, pb: 0 }}
                    >
                        <Typography>
                            <IconButton onClick={() => handleCourseOperations('lock', course.courseCode)}>
                                {(course.isLocked) ? <LockIcon /> : <LockOpenIcon />}
                            </IconButton>
                            <IconButton onClick={() => handleCourseOperations('delete', course.courseCode)}>
                                <DeleteOutlineIcon />
                            </IconButton>
                            [{course.courseCode}] {course.courseTitle}
                            <IconButton onClick={() => handleCourseCollapse(course.courseCode)}>
                                {courseCodeShow.includes(course.courseCode) ? <ExpandLess /> : <ExpandMore />}
                            </IconButton>
                        </Typography>
                        {
                            course.section &&
                            <Collapse in={courseCodeShow.includes(course.courseCode)} timeout="auto">
                                <List sx={{ p: 0 }}>
                                    <ListItem sx={{ pb: 0, pt: 0 }}>
                                        <Typography>
                                            <IconButton
                                                onClick={() => handleCourseOperations('lockSection', course.courseCode, 'section')}
                                                disabled={course.isLocked}
                                            >
                                                {course.section.isLocked ? <LockIcon /> : <LockOpenIcon />}
                                            </IconButton>
                                            <IconButton
                                                onClick={() => handleCourseOperations('deleteSection', course.courseCode, 'section')}
                                            >
                                                <DeleteOutlineIcon />
                                            </IconButton>
                                            {course.section.sectionCode}
                                        </Typography>
                                    </ListItem>
                                </List>
                            </Collapse>
                        }
                        {
                            course.tutorial &&
                            <Collapse in={courseCodeShow.includes(course.courseCode)} timeout="auto">
                                <List sx={{ p: 0 }}>
                                    <ListItem sx={{ pb: 0, pt: 0 }}>
                                        <Typography>
                                            <IconButton
                                                // need fix
                                                onClick={() => handleCourseOperations('lockSection', course.courseCode, 'tutorial')}
                                                disabled={course.isLocked}
                                            >
                                                {course.tutorial.isLocked ? <LockIcon /> : <LockOpenIcon />}
                                            </IconButton>
                                            <IconButton
                                                onClick={() => handleCourseOperations('deleteSection', course.courseCode, 'tutorial')}
                                            >
                                                <DeleteOutlineIcon />
                                            </IconButton>
                                            {course.tutorial.tutorialCode}
                                        </Typography>
                                    </ListItem>
                                </List>
                            </Collapse>
                        }
                    </ListItem>
                    <Divider sx={{ mt: 1, mb: 1, mx: 2 }} />
                </Box>
            )
            }
        </List>
    )
}

function SearchBar({ handleChangingCourse }) {
    const [input, setInput] = useState({ courseCode: "", university: "uoft", term: "F" });
    const [searchData, setSearchData] = useState(undefined)
    const filterOptions = createFilterOptions({
        limit: 10,
        ignoreCase: true
    })

    const terms = ['F', 'S', 'Y']

    useEffect(() => {
        if (input.courseCode && input.term && input.university) fetchCourse()
    }, [input])

    const fetchCourse = () => {
        console.log(input.courseCode.slice(0, 8))
        console.log(input.university.slice(0, 8))
        console.log(input.term.slice(0, 8))
        fetch("/courses", {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                courseCode: input.courseCode.slice(0, 8),
                university: input.university,
                term: input.term
            })
        })
            .then(res => res.json())
            .then(data => {
                console.log(data)
                setSearchData(data)
            })
            .catch(err => console.error(err))
    }

    const handleInputChange = (option, v) => {
        if (option === 'code') {
            setInput({
                ...input,
                courseCode: v
            })
        } else if (option === 'term') {
            setInput({
                ...input,
                term: v
            })
        } else {
            setInput({
                ...input,
                university: v
            })
        }
    }

    const handleAddCourseWithSection = (course) => {
        // call server make change
        // update current state for new user courses
        // handleAdding
        fetch('/users/courses/new', {
            method: 'POST',
            'Content-Type': 'application/json',
            body: JSON.stringify({
                course: course
            })
        })
            .then(res => res.json())
            .then(data => {
                if (data.success) {
                    handleChangingCourse(true)
                }
            })
    }

    return (
        <Box mb={2}>
            <Container>
                <FormGroup sx={{ mb: 1 }}>
                    <FormLabel id='search-label' sx={{ textAlign: 'left', mb: 2 }}>Search Course</FormLabel>
                    <Autocomplete
                        sx={{ mb: 2 }}
                        disablePortal
                        id="search-course"
                        options={courseData}
                        filterOptions={filterOptions}
                        onChange={(e, v) => handleInputChange('code', v)}
                        renderInput={(params) => <TextField {...params} label='Search Course' />} />
                    <FormLabel id="term-label" sx={{ textAlign: 'left' }}>Term</FormLabel>
                    <RadioGroup
                        row
                        sx={{ mx: 1 }}
                        value={input.term}
                        onChange={e => handleInputChange('term', e.target.value)}
                    >
                        {
                            terms.map(t =>
                                <FormControlLabel key={t}
                                    value={t}
                                    control={<Radio size='small' />}
                                    label={t}
                                />
                            )
                        }
                    </RadioGroup>
                </FormGroup>
            </Container>
            {(searchData === undefined) ?
                <></>
                :
                <List sx={{ maxHeight: 300, overflow: 'auto' }}>
                    <Divider sx={{ mt: 1, mb: 1, mx: 2 }} />
                    {(searchData.length === 0) ?
                        <Typography align='center'>No Course With Matching Name And Term</Typography>
                        :
                        <>
                            <ListItem sx={{ flexDirection: 'column', alignItems: 'baseline', pt: 0, pb: 0 }}>
                                <Typography>
                                    List of Lectures
                                    <List>
                                        {searchData[0].sections.map((lecture) =>
                                            <>
                                                <ListItem
                                                    key={lecture._id}
                                                    sx={{ flexDirection: 'column', alignItems: 'baseline', pt: 0, pb: 0 }}
                                                >
                                                    <Typography>
                                                        [{lecture.sectionCode}]
                                                        <Button sx={{ border: 1, borderRadius: 2 }}>
                                                            Add/Change
                                                        </Button>
                                                    </Typography>
                                                </ListItem>
                                            </>
                                        )}
                                    </List>
                                </Typography>
                            </ListItem>
                            <Divider sx={{ mt: 1, mb: 1, mx: 2 }} />
                            <ListItem sx={{ flexDirection: 'column', alignItems: 'baseline', pt: 0, pb: 0 }}>
                                <Typography>
                                    List of Tutorials
                                    <List>
                                        {searchData[0].tutorials.map((tutorial) =>
                                            <>
                                                <ListItem
                                                    key={tutorial._id}
                                                    sx={{ flexDirection: 'column', alignItems: 'baseline', pt: 0, pb: 0 }}
                                                >
                                                    <Typography>
                                                        [{tutorial.tutorialCode}]
                                                        <Button sx={{ border: 1, borderRadius: 2 }}>
                                                            Add/Change
                                                        </Button>
                                                    </Typography>
                                                </ListItem>
                                            </>
                                        )}
                                    </List>
                                </Typography>
                            </ListItem>
                        </>
                    }
                    <Divider sx={{ mt: 1, mb: 1, mx: 2 }} />
                </List>
            }
        </Box>

    )
}

export default SideMenu
