import { Text, View,StyleSheet} from "react-native"
const Search =()=>{
    return(
    <View style={styles.container}>
        <Text style={styles.AccountText}>
            home 
        </Text>
    </View>
        )
    }
    const styles = StyleSheet.create({
     container: {
            flex: 1,
            justifyContent: "center",
            alignItems: "center",
            backgroundColor: "#121212"
        }, AccountText: {
            color: "#E0E0E0",
            textAlign: "center",
            fontSize: 30,
            fontWeight: "bold",
            marginBottom: 30,
    
        },})
export default Search;