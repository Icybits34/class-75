import React, { Component } from "react";
import { View, Text, StyleSheet, TouchableOpacity, TextInput, Image, ImageBackground, ToastAndroid, KeyboardAvoidingView } from "react-native";
import firebase from firebase

const bgImg = require("../assets/background2.png")
const appIcon = require("../assets/appIcon.png")
const appName = require("../assets/appName.png")

export default class LoginScreen extends Component {

    constructor(props) {
        super(props)
        this.state = {
            email: "",
            password: "",
        }
    }


    render() {
        const { email, password } = this.state

        return (
            <KeyboardAvoidingView behavior="padding" style={styles.container}>
                <ImageBackground source={bgImg} style={styles.bgImg}>

                    <View style={styles.upperContainer}>
                        <Image source={appIcon} style={styles.appIcon} />
                        <Image source={appName} style={styles.appName} />
                    </View>
                    <View style={styles.lowerContainer}>

                        <TextInput
                            style={styles.textInput}
                            placeholder={"enterEmail"}
                            placeholderTextColor={"white"}
                            autoFocus
                            onChangeText={text => this.setState({ email: text })}></TextInput>

                        <TextInput
                            style={styles.textInput}
                            placeholder={"enterPass"}
                            placeholderTextColor={"white"}
                            secureTextEntry
                            onChangeText={text => this.setState({ password: text })}></TextInput>
                        <TouchableOpacity
                            style={styles.scanButton}
                            onPress={() => this.handleLogin(email, password)}>
                            <Text style={styles.scanButtonText}>login</Text>
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
  
  