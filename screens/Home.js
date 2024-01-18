import React, { useState, useEffect } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import {
  View,
  Image,
  Pressable,
  Text,
  StyleSheet,
  TextInput,
  FlatList,
} from "react-native";
import { GlobalStateContext } from "../GlobalStateProvider";
import * as SQLite from 'expo-sqlite';
import { createMenuTableInDBIfNotExisting, readAllMenuFromDB, writeMenuItemToDB, clearAllMenuDB, openSQLiteDB, db} from "../MenuDatabase";

const HomeScreen = ({ navigation }) => {
  const [
    state,
    setIsLoadingTrue,
    setIsLoadingFalse,
    setIsOnboardingCompleteTrue,
    setIsOnboardingCompleteFalse,
  ] = React.useContext(GlobalStateContext);
  const [userData, setUserData] = useState({});
  const [menu, setMenu] = useState([]);

  const API_URL = 'https://raw.githubusercontent.com/Meta-Mobile-Developer-PC/Working-With-Data-API/main/capstone.json';

  const getUserData = async () => {
    try {
      const userDataStr = await AsyncStorage.getItem("userData");
      const data = userDataStr != null ? JSON.parse(userDataStr) : null;
      setUserData(data);
    } catch (error) {
      setIsOnboardingCompleteFalse(); // Handle error of not stored userData - return to OnboardingScreen
      console.log(error);
    }
  };

  const getUserDataWrapper = async () => {
    console.log("in getUserDataWrapper");
    await getUserData();
    updateHeader();
  };

  const LogoTitle = () => {
    return (
      <Image
        style={{ height: 70, resizeMode: "contain" }}
        source={require("../img/Logo.png")}
      />
    );
  };

  const AvatarTitle = () => {
    console.log("in AvatarTitle");
    if (userData.avatarImage != null) {
      console.log(
        "in AvatarTitle: userData.avatarImage: ",
        userData.avatarImage
      );
      return (
        <Pressable
          onPress={() => {
            console.log("In HomeScreen: Avatar in Header pressed");
            navigation.navigate("Profile");
          }}
          disabled={false}
        >
          <Image
            style={{ width: 50, height: 50, resizeMode: "contain" }}
            source={{ uri: userData.avatarImage }}
          />
        </Pressable>
      );
    } else {
      console.log("in AvatarTitle: userData.avatarImage IS null");
      let initials = { first: ".", second: "." };
      if (userData.firstname != null && userData.firstname.length > 0) {
        console.log(
          "in AvatarTitle: userData.firstname NOT null: ",
          userData.firstname
        );
        initials.first = userData.firstname[0];
      }
      if (userData.lastname != null && userData.lastname.length > 0) {
        initials.second = userData.lastname[0];
      }
      return (
        <Pressable
          onPress={() => {
            console.log("In HomeScreen: Avatar in Header pressed");
            navigation.navigate("Profile");
          }}
          disabled={false}
        >
          <View
            style={{
              width: 50,
              height: 50,
              borderRadius: 40,
              backgroundColor: "#495E57",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Text style={{ fontSize: 40, fontWeight: "bold", color: "white" }}>
              {initials.first}
              {initials.second}
            </Text>
          </View>
        </Pressable>
      );
    }
  };

  const updateHeader = () => {
    navigation.setOptions({
      headerTitle: () => <LogoTitle />,
      headerRight: () => <AvatarTitle />,
      headerLeft: () => (
        <Pressable
          onPress={() => {
            console.log("In HomeScreen: left arrow pressed");
            //TODO: navigation.navigate('???');
          }}
          disabled={false}
          style={{
            borderColor: "#495E57",
            backgroundColor: "#495E57",
            borderWidth: 0,
            borderRadius: 20,
            width: 40,
            padding: 0,
            margin: 0,
            height: 40,
          }}
        >
          <Text
            style={{
              color: "white",
              textAlign: "center",
              fontSize: 22,
              fontWeight: "bold",
            }}
          >
            &larr;
          </Text>
        </Pressable>
      ),
    });
  };

  const FilterButton = ({ text, fn }) => {
    return (
      <Pressable
        onPress={() => {
          console.log("button pressed: ", text);
          fn();
        }}
        style={styles.buttonLightgreenRound}
      >
        <Text style={styles.buttonTextGreen}>{text}</Text>
      </Pressable>
    );
  };

  const readAllMenuFromDB = async () => {
    console.log('In readAllMenuFromDB');
    db.transaction((tx) => {
      tx.executeSql(
          'select * from menu;',
          [],
          (_, { rows: { _array } }) => setMenu(_array),
          (_, error) => {console.log("Error in readAllMenuFromDB: ",error);}
      )
    }
    )
  };

  const fetchDataFromAPI = async () => {
    try {
      const response = await fetch(API_URL);

      const json = await response.json();
      const menujson = await json.menu;

      await createMenuTableInDBIfNotExisting();
      menujson.forEach(menuEntry => {
        writeMenuItemToDB(menuEntry);
      });

    } catch (error) {
      console.log("Error in fetchDataFromAPI when reading the menu: ",error);
    }
  };

  const getMenuDataWrapper = async () => {
    await getMenuData();
  };

  const getMenuData = async () => {  
    // 1. check if menu has stored data already, if not start reading from the SQLite DB
    if (menu == null || menu.length == 0) {
      try {
        console.log("in getMenuData, menu is empty, read from SQLite DB now");
        await readAllMenuFromDB();

        // 2. check if menu is still without items, if so then read from API
        if (menu == null || menu.length == 0) {
          console.log("in getMenuData, menu is still empty, read from API now");
          await fetchDataFromAPI();  // read menu from API into the SQLite DB
          await readAllMenuFromDB(); // read menu from SQLite DB into the menu variable
          console.log("in getMenuData, menu items read from API and stored in SQLite DB, menu read from DB");
        } 
      } catch (error) {
        console.log("Error in creating or reading/writing DB-Table: ",error);
      }
    } else {
      console.log("in getMenuData, menu is right from the beginning NOT null and lenght > 0, menu: ", menu);
    }
  };

  const renderItem = ({ item }) => {
    let imageUri = `https://github.com/Meta-Mobile-Developer-PC/Working-With-Data-API/blob/main/images/${item.image}?raw=true`;
    return (
      <Pressable
      onPress={() => {
        console.log("button pressed: ", item.id, item.name);
        // TODO:
      }}
      >
      <View
        style={{
          flexDirection: "row",
          justifyContent: "space-evenly",
          width: '100%',
          marginTop: 10,
        }}
      >
        <View style={{flex: 5, marginRight: 10, borderColor: 'orange', borderWidth: 1}}>
          <Text style={styles.itemTitle}>{item.name}</Text>
          <Text style={styles.itemDescription} numberOfLines={2}>{item.description}</Text>
          <Text style={styles.itemPrice}>${item.price}</Text>
        </View>
        <Image
            style={{flex: 2, resizeMode: "contain" }}
            source={{ uri: imageUri }}
          />
      </View>
    </Pressable> 
    );
  };

  FlatListItemSeparator = () => {
    return (
      <View
        style={{
          height: 1,
          width: "100%",
          alignSelf: "center",
          backgroundColor: "lightgrey",
          marginTop: 10,
          marginLeft: 8,
          marginRight: 8,
        }}
      />
    );
  };



  useEffect(() => {
    console.log("In HomeScreen: useEffect []");
    openSQLiteDB();
    getUserDataWrapper();
    getMenuDataWrapper();
  }, []);

  return (
    <View style={styles.container}>
      <View style={styles.innerContainer1}>
        <Text style={styles.brandName}>Little Lemon</Text>
        <View style={styles.innerContainer2}>
          <View
            style={{
              flex: 5,
              marginRight: 5,
              borderColor: "orange",
              borderWidth: 1,
            }}
          >
            <Text style={styles.cityName}>Chicago</Text>
            <Text style={styles.regularText} numberOfLines={5}>
              We are a family owned Mediterranean restaurant, focused on
              traditional recipes served with a modern twist.
            </Text>
          </View>
          <View
            style={{
              flex: 3,
              marginLeft: 5,
              borderColor: "orange",
              borderWidth: 1,
            }}
          >
            <Image
              style={{
                width: 120,
                height: 120,
                borderRadius: 20,
                resizeMode: "contain",
              }}
              source={require("../img/Heroimage.png")}
            />
          </View>
        </View>
        <View
          style={{
            width: 50,
            height: 50,
            backgroundColor: "#EDEFEE",
            borderRadius: 25,
            margin: 10,
            padding: 15,
          }}
        >
          <Pressable
            onPress={() => {
              console.log("In HomeScreen: Search Lens pressed");
              // TODO:
            }}
          >
            <Image
              style={{ width: 20, height: 20, resizeMode: "contain" }}
              source={require("../img/searchLens.png")}
            />
          </Pressable>
        </View>
      </View>
      <View style={{ flexDirection: "row", alignItems: "left" }}>
        <Text style={styles.sectionTitle}>Order for Delivery</Text>
        <Image
          style={{
            width: 50,
            height: 50,
            resizeMode: "contain",
            marginLeft: 20,
          }}
          source={require("../img/DeliveryVan.png")}
        />
      </View>
      <View
        style={{
          flexDirection: "row",
          justifyContent: "space-evenly",
          marginTop: 10,
        }}
      >
        <FilterButton
          text="Starters"
          fn={() => {
            console.log("Filter on Startes");
          }}
        />
        <FilterButton
          text="Mains"
          fn={() => {
            console.log("Filter on Mains");
          }}
        />
        <FilterButton
          text="Desserts"
          fn={() => {
            console.log("Filter on Desserts");
          }}
        />
        <FilterButton
          text="Drinks"
          fn={() => {
            console.log("Filter on Drinks");
          }}
        />
      </View>
      <View
        style={{
          borderWidth: 0.8,
          borderRadius: 1,
          borderColor: "lightgrey",
          marginTop: 20,
        }}
      ></View>
      <FlatList
        data={menu}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
        ItemSeparatorComponent={FlatListItemSeparator}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "white",
    paddingLeft: 10,
    paddingRight: 10,
    paddingTop: 0,
    paddingBottom: 0,
  },
  innerContainer1: {
    paddingTop: 0,
    paddingRight: 0,
    alignItems: "left",
    backgroundColor: "#495E57",
  },
  innerContainer2: {
    flexDirection: "row",
    justifyContent: "space-evenly",
    paddingTop: 0,
    paddingLeft: 10,
    paddingRight: 10,
    paddingBottom: 0,
    alignItems: "center",
  },
  avatarImage: {
    width: 80,
    height: 80,
    borderRadius: 40,
    borderColor: "lightgrey",
    borderWidth: 1,
  },
  brandName: {
    fontSize: 40,
    fontWeight: "bold",
    paddingLeft: 10,
    paddingTop: 10,
    color: "#F4CE14",
    textAlign: "left",
  },
  cityName: {
    fontSize: 30,
    fontWeight: "bold",
    padding: 0,
    marginTop: 0,
    color: "white",
    textAlign: "left",
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "bold",
    padding: 0,
    marginTop: 10,
    color: "black",
    textAlign: "left",
  },
  itemTitle: {
    fontSize: 20,
    fontWeight: "bold",
    paddingLeft: 8,
    marginTop: 10,
    color: "black",
    textAlign: "left",
  },
  itemDescription: {
    fontSize: 16,
    paddingLeft: 8,
    marginTop: 10,
    color: "#495E57",
    textAlign: "left",
  },
  itemPrice: {
    fontSize: 16,
    fontWeight: "bold",
    paddingLeft: 8,
    marginTop: 10,
    color: "#495E57",
    textAlign: "left",
  },
  regularText: {
    fontSize: 16,
    fontWeight: "bold",
    padding: 8,
    marginTop: 10,
    color: "white",
    textAlign: "left",
  },
  buttonDisabled: {
    padding: 6,
    borderColor: "grey",
    backgroundColor: "grey",
    borderWidth: 2,
    borderRadius: 6,
    width: 80,
  },
  buttonLightgreenRound: {
    padding: 6,
    borderColor: "#EDEFEE",
    backgroundColor: "#EDEFEE",
    borderWidth: 2,
    borderRadius: 16,
    width: 80,
  },
  buttonTextGreen: {
    color: "#495E57",
    textAlign: "center",
    fontSize: 16,
  },
  inputHeadline: {
    fontSize: 11,
    fontWeight: "bold",
    padding: 4,
    marginTop: 10,
    color: "#495E57",
    textAlign: "left",
  },
  inputBox: {
    marginRight: 10,
    marginVertical: 2,
    borderWidth: 1,
    borderRadius: 8,
    padding: 6,
    paddingLeft: 10,
    fontSize: 15,
    color: "#495E57",
    textAlign: "left",
    borderColor: "#495E57",
    backgroundColor: "white",
    width: 280,
  },
  checkboxRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 10,
  },
  checkboxLabel: {
    fontSize: 15,
    color: "#495E57",
    textAlign: "left",
    paddingLeft: 15,
  },
  buttonEnabledLogout: {
    padding: 6,
    borderColor: "#F4CE14",
    backgroundColor: "#F4CE14",
    borderWidth: 2,
    borderRadius: 9,
    width: "100%",
    alignSelf: "center",
    marginTop: 20,
  },
  buttonTextBlack: {
    color: "black",
    textAlign: "center",
    fontSize: 16,
    fontWeight: "bold",
  },
  headercontainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    width: "100%",
    backgroundColor: "white",
  },
  headerimage: {
    height: 70,
    marginStart: 10,
  },
  avatarImageHeadline: {
    width: 60,
    height: 60,
    marginEnd: 10,
    borderRadius: 100,
  },
});

export default HomeScreen;
