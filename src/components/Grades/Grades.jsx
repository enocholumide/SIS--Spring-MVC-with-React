import React, { Component } from 'react';
import { Row, Col } from 'reactstrap';
import { View } from 'react-native-web';
import {  Message } from 'semantic-ui-react';
import HeaderNavigator from '../../shared/Header/Header';
import { colors, apis, current_student_id } from '../../shared/config.js';
import axios from 'axios';
import Loading from '../../shared/Loader';
import GradeCard from './GradeCard';
import moment from 'moment'

class Grade extends Component {

    constructor(props) {
        super(props)

        this.state = {
            gradesAreReady: false,
            loadingMessage: "Retrieving your grades from server ...",
            grades: undefined
        }
    }


    async componentDidMount() {

        await this.loadGradesFromServer();

        window.addEventListener("resize", this.setState(this.state));

    }

    /**
     * Remove event listener
     */
    componentWillUnmount() {
        window.removeEventListener("resize", this.setState(this.state));
    }

    /**
     * Loads student grades from the server
     */
    loadGradesFromServer() {

        this.setState({ gradesAreReady: false })

        axios.get(apis.student_grades + current_student_id)
            .then((response) => {

                if (response.status === 200) { // OK

                    this.setState({ gradesAreReady: true, grades: response.data })

                }

            })
            .catch((error) => {
                this.setState({ gradesAreReady: false, loadingMessage: error })
            })


    }

    render() {

        return (

            <div>
                <HeaderNavigator activeIndex={4} />

                <div>

                    {
                        this.state.gradesAreReady ?

                            this.renderComponent()

                            :

                            <Loading text={this.state.loadingMessage} />
                    }
                </div>

            </div>
        );
    }

    /**
     * Separates grades with a simple header
     * @param grade grade to be formated
     * @returns string of formatted header
     */
    formatGradeSectionHeader = (grade) => {

        return (

            grade.course.session + " SEMESTER " + moment(grade.start).format("YY").toString() + "/" + moment(grade.end).format("YY").toString()

        )

    }

    /**
     * Shows the list of grades of all semesters the student has enrolled
     */
    renderGrades = () => {

        let { grades } = this.state;

        if (grades.length > 0) {
            return (


                <div>

                    <Message info >
                        <Message.Header>About your grades: </Message.Header>
                        <p>Please note:</p>
                        <Message.List items={[
                            "You can download and export your current grade as transcript",
                            "If you apply for a student job, your current grade will be shared with the lecturer",
                            "Your grades are only visible to you , unless you share them",
                            "You may expand each grade and view the course statistics",
                            "If you feel there is a problem with your grade, please report an issue immediately!"
                        ]} />

                    </Message>

                    {

                        grades.map((grade, index) =>

                            <div key={index}>
                                {
                                    index === 0 ?

                                        <p style={{ padding: 10, marginBottom: 10, backgroundColor: colors.muteColor }}>
                                            {this.formatGradeSectionHeader(grade)}
                                        </p>

                                        : null
                                }


                                {
                                    index > 0 && (
                                        grade.course.session !== grades[index - 1].course.session ||
                                        moment(grade.start).format("YY").toString() !== moment(grades[index - 1].start).format("YY").toString()
                                    )

                                        ?

                                        <p style={{ padding: 10, marginTop: 10, marginBottom: 10, backgroundColor: colors.muteColor }}>
                                            {this.formatGradeSectionHeader(grade)}
                                        </p>

                                        : null

                                }

                                <GradeCard grade={grade} />

                            </div>

                        )
                    }

                </div>

            )
        }

        return (
            <p>No grades</p>
        )
    }


    renderComponent = () => {



        return (
            <div>

                <Row>
                    <Col lg="4" xs="3" sm="3" style={{ backgroundColor: colors.muteColor }}>


                        <View style={{ flex: 1, flexDirection: 'row', padding: 10 }}>

                            <p>col-sm-4</p>

                        </View>


                    </Col>
                    <Col lg="4" xs="6" sm="6" style={{ backgroundColor: "white", padding: 10 }}>


                        {this.renderGrades()}


                    </Col>
                    <Col lg="4" xs="3" sm="3" style={{ backgroundColor: colors.muteColor }}>



                        .col-sm-4


                        </Col>
                </Row>

            </div>
        );
    }
}

export default Grade;