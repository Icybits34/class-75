import React,{Component} from "react";
import { View,Text,StyleSheet,FlatList,TextInput,TouchableOpacity } from "react-native";
import db from "../config"



export default class SearchScreen extends Component {
    constructor(props) {
        super(props)
        this.state = {
          allTransactions:[],
          lastVisibleTransactions:null,
          searchText:"",
        }
      }

      getTransactions =()=> {
        db.collection("transactions")
          .get()
          .then(snapshot => {
            snapshot.docs.map(doc => {
              this.setState({
           allTransactions:[...this.state.allTransactions,doc.data()]
              })
            })
          })
      }



      handleSearch = async text => {
        var enteredText = text.toUpperCase().split("");
        text = text.toUpperCase();
        this.setState({
          allTransactions: []
        });
        if (!text) {
          this.getTransactions();
        }
    
        if (enteredText[0] === "B") {
          db.collection("transactions")
            .where("book_id", "==", text)
            .get()
            .then(snapshot => {
              snapshot.docs.map(doc => {
                this.setState({
                  allTransactions: [...this.state.allTransactions, doc.data()]
                });
              });
            });
        } else if (enteredText[0] === "S") {
          db.collection("transactions")
            .where("student_id", "==", text)
            .get()
            .then(snapshot => {
              snapshot.docs.map(doc => {
                this.setState({
                  allTransactions: [...this.state.allTransactions, doc.data()]
                });
              });
            });
        }
      };
      renderItem = ({ item, i }) => {
        var date = item.date
          .toDate()
          .toString()
          .split(" ")
          .splice(0, 4)
          .join(" ");
    
        var transactionType =
          item.transaction_type === "issue" ? "issued" : "returned";
        return (
          <View style={{ borderWidth: 1 }}>
            <ListItem key={i} bottomDivider>
              <Icon type={"antdesign"} name={"book"} size={40} />
              <ListItem.Content>
                <ListItem.Title style={styles.title}>
                  {`${item.book_name} ( ${item.book_id} )`}
                </ListItem.Title>
                <ListItem.Subtitle style={styles.subtitle}>
                  {`This book ${transactionType} by ${item.student_name}`}
                </ListItem.Subtitle>
                <View style={styles.lowerLeftContaiiner}>
                  <View style={styles.transactionContainer}>
                    <Text
                      style={[
                        styles.transactionText,
                        {
                          color:
                            item.transaction_type === "issue"
                              ? "#78D304"
                              : "#0364F4"
                        }
                      ]}
                    >
                      {item.transaction_type.charAt(0).toUpperCase() +
                        item.transaction_type.slice(1)}
                    </Text>
                    <Icon
                      type={"ionicon"}
                      name={
                        item.transaction_type === "issue"
                          ? "checkmark-circle-outline"
                          : "arrow-redo-circle-outline"
                      }
                      color={
                        item.transaction_type === "issue" ? "#78D304" : "#0364F4"
                      }
                    />
                  </View>
                  <Text style={styles.date}>{date}</Text>
                </View>
              </ListItem.Content>
            </ListItem>
          </View>
        );
      };

fetchMoreTransactions=async text=>{
    var enteredText = text.toUpperCase().split("");
    text = text.toUpperCase();
    const{lastVisibleTransactions,allTransactions}=this.state

    if (enteredText[0] === "B") {
        db.collection("transactions")
          .where("book_id", "==", text)
          .startAfter(this.state.lastVisibleTransactions)
          .limit(10)
          .get()
          .then(snapshot => {
            snapshot.docs.map(doc => {
              this.setState({
                allTransactions: [...this.state.allTransactions, doc.data()],
                lastVisibleTransactions:doc
              });
            });
          });
      } else if (enteredText[0] === "S") {
        db.collection("transactions")
          .where("student_id", "==", text)
          .startAfter(this.state.lastVisibleTransactions)
          .limit(10)
          .get()
          .then(snapshot => {
            snapshot.docs.map(doc => {
              this.setState({
                allTransactions: [...this.state.allTransactions, doc.data()],
                lastVisibleTransactions:doc
              });
            });
          });
      }
    
}
    
      render() {
        const { searchText, allTransactions } = this.state;
        return (
          <View style={styles.container}>
            <View style={styles.upperContainer}>
              <View style={styles.textinputContainer}>
                <TextInput
                  style={styles.textinput}
                  onChangeText={text => this.setState({ searchText: text })}
                  placeholder={"Type here"}
                  placeholderTextColor={"#FFFFFF"}
                />
                <TouchableOpacity
                  style={styles.scanbutton}
                  onPress={() => this.handleSearch(searchText)}
                >
                  <Text style={styles.scanbuttonText}>Search</Text>
                </TouchableOpacity>
              </View>
            </View>
            <View style={styles.lowerContainer}>
              <FlatList
                data={allTransactions}
                renderItem={this.renderItem}
                keyExtractor={(item, index) => index.toString()}
                onEndReached={()=>this.fetchMoreTransactions(searchText)}
                onEndReachedThreshold={0.7}
              />
            </View>
          </View>
        );
      }
    }

const styles=StyleSheet.create(
    {
        container:{
            flex:1,
            justifyContent:"center",
            alignItems:"center",
            backgroundColor:"#5653D4",
        },
        text:{
            color:"#FFFF",
            fontSize:30,
        }
    }
)
