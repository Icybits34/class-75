import React, { Component } from "react";
import { View, Text, StyleSheet, TouchableOpacity, TextInput, Image, ImageBackground, ToastAndroid, KeyboardAvoidingView } from "react-native";
import * as Permissions from "expo-permissions";
import { BarCodeScanner } from "expo-barcode-scanner"

const bgImg = require("../assets/background2.png")
const appIcon = require("../assets/appIcon.png")
const appName = require("../assets/appName.png")

export default class TransactionScreen extends Component {

  constructor(props) {
    super(props)
    this.state = {
      domState: "normal",
      bookId: "",
      studentId: "",
      hasCameraPermissions: null,
      scanned: false,
      scannedData: "",
      bookName: "",
      studentName: "",
    }
  }

  getCameraPermissions = async domState => {
    const { status } = await Permissions.askAsync(Permissions.CAMERA)
    this.setState({
      hasCameraPermissions: status === "granted",
      domState: domState,
      scanned: false

    })
  }

  handleBarcodeScanned = async ({ type, data }) => {
    this.setState({
      scannedData: data,
      domState: "normal",
      scanned: true,
    })
  }

  handleTransaction = async () => {
    var { bookId, studentId } = this.state
    await this.getBookDetails(bookId)
    await this.getStudentDetails(studentId)

    var transaction_type = await this.checkBookAvailability(bookId)
    if (!transaction_type) {
      this.setState({
        bookId: "",
        studentId: "",
      })
      Alert.alert("book doesn't exist in libary database")
    }
    else if (transaction_type === "issue") {
      var isEligible = await this.checkStudentEligibilityForBookIssue(studentId)
      if (isEligible) {
        var { studentName, bookName } = this.state
        this.initiateBookIssue(bookId, studentId, bookName, studentName)
      }
      Alert.alert("book issued to the student")
    }
    else {
      var { studentName, bookName } = this.state
      var isEligible = await this.checkStudentEligibilityForBookReturn(bookId,studentId)
      if (isEligible) {
        var { studentName, bookName } = this.state
      this.initiateBookReturn(bookId, studentId, bookName, studentName)
      }
      Alert.alert("book returned by the student")
    }

    db.collection("books")
      .doc(bookId)
      .get()
      .then(doc => {
        console.log(doc.data())
        var book = doc.data()
        if (book.is_book_available) {
          this.initiateBookIssue(bookId, studentId, bookName, studentName)
          ToastAndroid.show("book issued to the student", ToastAndroid.SHORT)
        }
        else {
          var { bookName, studentName } = this.state
          this.initiateBookReturn(bookId, studentId, bookName, studentName)
          ToastAndroid.show("book returned by the student", ToastAndroid.SHORT)
        }
      })

  }


  initiateBookIssue = async (bookId, studentId, bookName, studentName) => {
    console.log("book issued to the student")
    db.collection("transaction").add({
      student_id: studentId,
      student_name: studentName,
      book_id: bookId,
      book_name: bookName,
      date: firebase.firestore.Timestamp.now().toDate(),
      transaction_type: "issue"
    })
    db.collection("books")
      .doc(bookId)
      .update({
        is_book_available: false
      })
    db.collection("students")
      .doc(studentId)
      .update({
        number_of_books_issued: firebase.firestore.FieldValue.increment(1)
      })
    this.setState({
      bookId: "",
      studentId: "",
    })
  }

  initiateBookReturn = async (bookId, studentId, bookName, studentName) => {
    console.log("book returned by the student")
    db.collection("transaction").add({
      student_id: studentId,
      student_name: studentName,
      book_id: bookId,
      book_name: bookName,
      date: firebase.firestore.Timestamp.now().toDate(),
      transaction_type: "return"
    })
    db.collection("books")
      .doc(bookId)
      .update({
        is_book_available: true
      })
    db.collection("students")
      .doc(studentId)
      .update({
        number_of_books_issued: firebase.firestore.FieldValue.increment(-1)
      })
    this.setState({
      bookId: "",
      studentId: "",
    })
  }

  getBookDetails = bookId => {
    bookId = bookId.trim()
    db.collection("books")
      .where("book_id", "==", bookId)
      .get()
      .then(snapshot => {
        snapshot.docs.map(doc => {
          this.setState({
            bookName: doc.data().book_details.book_name
          })
        })
      })
  }

  getStudentDetails = studentId => {
    studentId = studentId.trim()
    db.collection("students")
      .where("student_id", "==", studentId)
      .get()
      .then(snapshot => {
        snapshot.docs.map(doc => {
          this.setState({
            studentName: doc.data().student_details.student_name
          })
        })
      })
  }

  checkBookAvailability = async bookId => {
    const bookRef = await
      db.collection("books")
        .where("book_id", "==", bookId)
        .get()
    var transaction_type = ""
    if (bookRef.docs.length === 0) {
      transaction_type = false
    }
    else {
      bookRef.docs.map(doc => {
        transaction_type.doc.data().is_book_available ? "issue" : "return"
      })
    }
    return transaction_type
  }

  checkStudentEligibilityForBookIssue=async studentId=>{
     const studentRef = await
    db.collection("student")
      .where("student_id", "==", studentId)
      .get()
  }


  
  render() {
    const { domState, hasCameraPermissions, scanned, scannedData } = this.state
    if (domState === "scanner") {
      return (
        <BarCodeScanner onBarCodeScanned={scanned ? undefined : this.handleBarcodeScanned}
          style={StyleSheet.absoluteFillObject}></BarCodeScanner>
      )
    }
    return (
      <KeyboardAvoidingView behavior="padding" style={styles.container}>
        <ImageBackground source={bgImg} style={styles.bgImg}>

          <View style={styles.upperContainer}>
            <Image source={appIcon} style={styles.appIcon} />
            <Image source={appName} style={styles.appName} />
          </View>
          <View style={styles.lowerContainer}>
            <View style={styles.textInputContainer}>
              <TextInput
                style={styles.textInput}
                placeholder={"bookId"}
                placeholderTextColor={"white"}
                value={bookId}
                onChangeText={text => this.setState({ bookId: text })}></TextInput>
              <TouchableOpacity
                style={styles.scanButton}
                onPress={() => this.getCameraPermissions("bookId")}>
                <Text style={styles.scanButtonText}>scan</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.textInputContainer}>
              <TextInput
                style={styles.textInput}
                placeholder={"studentId"}
                placeholderTextColor={"white"}
                value={studentId}
                onChangeText={text => this.setState({ studentId: text })}></TextInput>
              <TouchableOpacity
                style={styles.scanButton}
                onPress={() => this.getCameraPermissions("studentId")}>
                <Text style={styles.scanButtonText}>scan</Text>
              </TouchableOpacity>
            </View>

            <TouchableOpacity
              style={styles.button}
              onPress={this.handleTransaction}>
              <Text style={styles.buttonText}>sumbit</Text>
            </TouchableOpacity>
          </View>
        </ImageBackground>
      </KeyboardAvoidingView>


    )
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFFFFF"
  },
  bgImage: {
    flex: 1,
    resizeMode: "cover",
    justifyContent: "center"
  },
  upperContainer: {
    flex: 0.5,
    justifyContent: "center",
    alignItems: "center"
  },
  appIcon: {
    width: 200,
    height: 200,
    resizeMode: "contain",
    marginTop: 80
  },
  appName: {
    width: 80,
    height: 80,
    resizeMode: "contain"
  },
  lowerContainer: {
    flex: 0.5,
    alignItems: "center"
  },
  textinputContainer: {
    borderWidth: 2,
    borderRadius: 10,
    flexDirection: "row",
    backgroundColor: "#9DFD24",
    borderColor: "#FFFFFF"
  },
  textinput: {
    width: "57%",
    height: 50,
    padding: 10,
    borderColor: "#FFFFFF",
    borderRadius: 10,
    borderWidth: 3,
    fontSize: 18,
    backgroundColor: "#5653D4",
    fontFamily: "Rajdhani_600SemiBold",
    color: "#FFFFFF"
  },
  scanbutton: {
    width: 100,
    height: 50,
    backgroundColor: "#9DFD24",
    borderTopRightRadius: 10,
    borderBottomRightRadius: 10,
    justifyContent: "center",
    alignItems: "center"
  },
  scanbuttonText: {
    fontSize: 24,
    color: "#0A0101",
    fontFamily: "Rajdhani_600SemiBold"
  }
});

