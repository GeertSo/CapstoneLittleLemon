import React, { useState } from "react";
import {
  View,
  StyleSheet,
  Image,
  Text,
  Pressable,
  TextInput,
  ScrollView,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { GlobalStateContext } from "../GlobalStateProvider";

const validateEmail = (email) => {
  return email.match(
    /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
  );
};

const OnboardingScreen = ({ navigation }) => {
  const [
    state,
    setIsLoadingTrue,
    setIsLoadingFalse,
    setIsOnboardingCompleteTrue,
    setIsOnboardingCompleteFalse,
  ] = React.useContext(GlobalStateContext);
  const [firstname, setFirstname] = useState("");
  const [email, setEmail] = useState("");
  const [validEmail, setValidEmail] = useState(false);
  const [validName, setValidName] = useState(false);

  const onChangeEmail = (e) => {
    setEmail(e);
    setValidEmail(validateEmail(email));
  };

  const onChangeName = (e) => {
    if (firstname.length > 0 || e != " ") {
      // skip leading spaces
      setFirstname(e);
    }
    setValidName(firstname.length > 0);
    // console.log("Firstname: ",firstname);
  };

  const storeUserInfo = async () => {
    let userData = {
      firstname: firstname,
      lastname: null,
      email: email,
      avatarImage: null,
      phone: null,
      orderStatus: false,
      passwordChanges: false,
      specialOffers: false,
      newsletter: false,
    };
    try {
      await AsyncStorage.setItem("userData", JSON.stringify(userData));
      setIsOnboardingCompleteTrue();
    } catch (error) {
      console.log(error);
      Alert.alert(
        "Data not stored",
        "Your input data could not be stored. Please try again"
      );
    }

    return;
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.headercontainer}>
        <Image
          style={styles.headerimage}
          source={require("../img/Logo.png")}
          resizeMode="contain"
          accessible={true}
          accessibilityLabel={"Little Lemon Logo"}
        />
      </View>

      <View style={styles.textInputContainer}>
        <Text style={styles.regularText}>Let us get to know you</Text>
        <Text style={{ ...styles.regularText, marginTop: 40 }}>First Name</Text>
        <TextInput
          style={styles.inputBox}
          value={firstname}
          onChangeText={onChangeName}
          placeholder={"Enter your first name"}
          keyboardType={"default"}
        />
        <Text style={styles.regularText}>Email</Text>
        <TextInput
          style={styles.inputBox}
          value={email}
          onChangeText={onChangeEmail}
          placeholder={"Enter your email"}
          keyboardType={"email-address"}
        />
      </View>

      <View style={styles.footercontainer}>
        <View style={styles.buttonContainer}>
          <Pressable
            onPress={() => storeUserInfo()}
            disabled={!validEmail || !validName}
            style={
              validEmail && validName
                ? styles.buttonEnabled
                : styles.buttonDisabled
            }
          >
            <Text style={styles.buttonText}>Next</Text>
          </Pressable>
        </View>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  headercontainer: {
    backgroundColor: "lightgrey",
    alignItems: "center",
  },
  textInputContainer: {
    backgroundColor: "grey",
    alignItems: "center",
    paddingVertical: 40,
  },
  footercontainer: {
    backgroundColor: "lightgrey",
  },
  headerimage: {
    width: 350,
    marginVertical: 20,
  },
  regularText: {
    fontSize: 24,
    padding: 8,
    marginTop: 20,
    color: "black",
    textAlign: "center",
  },
  inputBox: {
    marginLeft: 10,
    marginRight: 10,
    marginVertical: 2,
    borderWidth: 1,
    borderRadius: 8,
    padding: 6,
    paddingLeft: 10,
    fontSize: 18,
    borderColor: "black",
    backgroundColor: "white",
    width: 280,
  },
  buttonContainer: {
    marginTop: 20,
    marginLeft: "70%",
    marginBottom: 20,
  },
  buttonDisabled: {
    padding: 6,
    borderColor: "grey",
    backgroundColor: "grey",
    borderWidth: 2,
    borderRadius: 6,
    width: 80,
  },
  buttonEnabled: {
    padding: 6,
    borderColor: "green",
    backgroundColor: "green",
    borderWidth: 2,
    borderRadius: 6,
    width: 80,
  },
  buttonText: {
    color: "black",
    textAlign: "center",
    fontSize: 18,
  },
});

export default OnboardingScreen;
