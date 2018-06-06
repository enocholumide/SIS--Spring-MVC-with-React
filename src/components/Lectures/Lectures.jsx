import React, { Component } from 'react';
import HeaderNavigator from '../../shared/Header/Header';
import { Button, Dropdown, List, Message } from 'semantic-ui-react';
import { View, ScrollView } from 'react-native-web'
import { Row, Col } from 'reactstrap';
import { colors } from '../../shared/appStyles';
import { apis } from '../../shared/config.js';
import axios from 'axios';
import LectureCard from './LectureCard';

class Lecture extends Component {

    constructor(props) {
        super(props)

        this.state = {

            alllectures: [],
            alldepartments: [],
            departmentDropdown: [],
            selectedDepartment: "",
            selectedLevel: "",
            selectedSemester: "",

        }
    }

    async componentWillMount() {
        await this.loadLecturesFromServer();
    }

    loadLecturesFromServer = () => {

        axios.all(
            [
                axios.get(apis.courses),
                axios.get(apis.departments)
            ])
            .then(axios.spread((coursesResponse, departmentsResponse) => {

                if (coursesResponse.status === 200 && departmentsResponse.status === 200) {

                    console.log(coursesResponse.data)
                    console.log(departmentsResponse.data)


                    let departmentDropdown = this.mapDepartmentsToDropDownList(departmentsResponse.data);
                    //console.log(coursesResponse.data)

                    this.setState({
                        alllectures: coursesResponse.data,
                        alldepartments: departmentsResponse.data,
                        departmentDropdown: departmentDropdown,
                        selectedDepartment: departmentDropdown[0].text,
                        selectedLevel: "BACHELOR",
                        selectedSemester: 1
                    })


                }

            }))
            .catch(error => console.log(error))


    }

    /**
     * Apply lectures search filter
     * @param alllectures : lectures to be filtered
     * @returns the fitlered list
     */
    applyFilters = (alllectures) => {

        const { selectedDepartment, selectedLevel, selectedSemester } = this.state;
        let courses = alllectures;

        // 1. Filter by department
        if (selectedDepartment.length > 0) {
            courses = courses.filter((course =>
                course.programs.some((program) => program.department.name === selectedDepartment)))
        }
        // 2. Filter by programe level
        if (selectedLevel.length > 0) {
            courses = courses.filter(course => course.level === selectedLevel)
        }
        // 3. Filter by semester
        if (selectedSemester > 0) {
            courses = courses.filter(course => course.semester === selectedSemester)
        }

        return courses;
    }

    /**
     * Map the course data the drop down list
     * @param lectures: lectures to be mapped
     */
    mapLecturesToDropDownList = (lectures) => {

        let searchList = [];

        for (let lecture of lectures) {

            let displayText = lecture.program.department.name

            searchList.push(
                {
                    text: displayText,
                    value: displayText,
                    key: lecture.id
                }
            )
        }

        return searchList;
    }

    mapDepartmentsToDropDownList = (departments) => {

        let searchList = [];

        for (let department of departments) {

            let displayText = department.name

            searchList.push(
                {
                    text: displayText,
                    value: displayText,
                    key: department.id
                }
            )
        }

        return searchList;
    }

    renderSemesters = (department) => {

        let sem = 1;
        for (let program of department.programsOffered) {

            let prSem = program.split("&");

            if (prSem[0].toUpperCase() === this.state.selectedLevel.toUpperCase()) {
                sem = prSem[1]
                break;
            }
        }

        let semesters = [];
        for (var i = 0; i < sem; i++) {
            semesters.push(i);
        }

        return (
            <Button.Group>
                {
                    semesters.map((sem, index) =>
                        <Button
                            key={index}
                            onClick={() => this.setState({ selectedSemester: index + 1 })}
                            positive={this.state.selectedSemester === index + 1 ? true : false}
                            style={{ marginLeft: 5, marginRight: 5 }}>
                            {index + 1}
                        </Button>
                    )
                }
            </Button.Group>
        )
    }

    renderComponent = () => {

        let { departmentDropdown, alldepartments, alllectures, selectedDepartment } = this.state;
        let department = alldepartments.filter(cdepartment => cdepartment.name === selectedDepartment)[0];
        let lectures = this.applyFilters(alllectures);

        return (

            <div>

                <View style={{ flexDirection: 'column' }}>

                    <Dropdown
                        placeholder='Search course or departments'
                        fluid search selection
                        options={departmentDropdown}
                        defaultValue={departmentDropdown[0].text}
                        onChange={(event, data) => this.setState({ selectedDepartment: data.value })}
                    />

                    <View>

                        <Button.Group style={{ margin: 20, justifyContent: 'center'}}>

                            {
                                department.programsOffered.map((program, index) =>

                                    <Button.Group key={index}>
                                        {
                                            index > 0 ? <Button.Or></Button.Or> : null
                                        }
                                        <Button
                                            onClick={() => this.setState({ selectedLevel: program.split("&")[0] })}
                                            positive={this.state.selectedLevel === program.split("&")[0]}>
                                            {program.split("&")[0]}
                                        </Button>
                                    </Button.Group>
                                )
                            }

                        </Button.Group>

                        <p>Semesters</p>

                        <ScrollView horizontal>
                            {this.renderSemesters(department)}
                        </ScrollView>

                        {
                            lectures.length > 0 ?

                                <View>
                                    <List animated verticalAlign='middle'>
                                        {
                                            lectures.map(
                                                (lecture, index) =>
                                                    <List.Item key={index}>
                                                        <LectureCard lecture={lecture} />
                                                    </List.Item>
                                            )

                                        }
                                    </List>
                                </View>

                                :

                                this.showErrorMessage('No lectures found for the current selection',

                                    [
                                        'Department : ' + this.state.selectedDepartment,
                                        'Program Level : ' + this.state.selectedLevel,
                                        'Semester : ' + this.state.selectedSemester,
                                    ]
                                )
                        }

                    </View>
                </View>
            </div>
        )


    }

    showErrorMessage = (header, list) => {

        return (

            <View style={{ marginVertical: 20 }}>

                <Message
                    error
                    header={header}
                    list={list}
                />
            </View>
        )
    }

    render() {

        let { alldepartments } = this.state

        return (
            <div>
                <HeaderNavigator activeIndex={3} />
                <Row>
                    <Col lg="4" xs="3" sm="3" style={{ backgroundColor: colors.muteColor }}>


                        <View style={{ flex: 1, flexDirection: 'row', padding: 10 }}>

                            <p>col-sm-4</p>

                        </View>


                    </Col>
                    <Col lg="4" xs="6" sm="6" style={{ backgroundColor: "white", padding: 10 }}>

                        {
                            alldepartments.length > 0 ? this.renderComponent() : null
                        }



                    </Col>
                    <Col lg="4" xs="3" sm="3" style={{ backgroundColor: colors.muteColor }}>



                        .col-sm-4


                        </Col>
                </Row>

            </div>
        );
    }

}

export default Lecture;
