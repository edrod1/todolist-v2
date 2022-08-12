//jshint esversion:6

const express = require('express');
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const _ = require("lodash");

const app = express();

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({
  extended: true
}));
app.use(express.static("public"));
// Run main function and catch error
main().catch((err) => console.log(err));

// async function
async function main() {

  const url = 'mongodb+srv://admin-edgar:Test123@cluster0.mymjlk1.mongodb.net';
  const dbPath = "/todolistDB";
  await mongoose.connect(url + dbPath);
  //{useNewUrlParser: true} //(no longer necessary)avoids depreciation warning

  const itemSchema = new mongoose.Schema({
    name: String
  });

  const Item = new mongoose.model("Item", itemSchema);

  const item1 = new Item({
    name: "Welcome to your todolist!"
  });

  const item2 = new Item({
    name: "Hit the + button to add a new item."
  });

  const item3 = new Item({
    name: "<-- Hit this to delete an item."
  });

  const defaultItems = [item1, item2, item3];

const listSchema = {
  name: String,
  items: [itemSchema]
};

const List = mongoose.model("List", listSchema);

  // await Item.deleteOne({_id: "62f32f7b0f89eaf8ea4916cf"}, function(err){
  //      if (err){
  //        console.log(err);
  //      } else {
  //        console.log("Succesfully deleted all the documents.");
  //      }
  //    });
  app.get("/", function(req, res) {

    Item.find({}, function(err, foundItems) {

      if (foundItems.length === 0) {
        Item.insertMany(defaultItems, function(err) {
          if (err) {
            console.log(err);
          } else {
            console.log("Succesfully saved all items to todolistDB!");
          }
        });
        res.redirect("/"); //redirected back to app.get("/", function(req, res)
      } else {
        res.render("list", {listTitle: "Today", newListItems: foundItems});
      }
    });

  });

app.get("/:customListName", function(req, res){
  const customListName = _.capitalize(req.params.customListName); // console.log(req.params.customListName);

      //one doc                             //function(error, result)
  List.findOne({name: customListName}, function(err, foundList){
    if (!err){
      if(!foundList){
      //Create a new list
      const list = new List({
        name: customListName,
        items: defaultItems
      });

      list.save();
      res.redirect("/" + customListName);
      } else {
            //list.ejs                //Show an existing list
    res.render("list", {listTitle: foundList.name, newListItems: foundList.items})
    }
  }
});

});

app.post("/", function(req, res) {

  const itemName = req.body.newItem;
  const listName = req.body.list;

  const item = new Item({
    name: itemName
  });

  if (listName === "Today") {
    item.save();
    res.redirect("/");
  } else {
    List.findOne({  name: listName}, function(err, foundList) {
      foundList.items.push(item);
      foundList.save();
      res.redirect("/" + listName);
    });
  }
});

app.post("/delete", function(req, res){
  const checkedItemId = req.body.checkbox;
  const listName =req.body.listName;

if (listName === "Today") {
  Item.findByIdAndRemove(checkedItemId, function(err){
    if (!err) {
      console.log(err);
    } else {
      console.log("Succesfully deleted checked item.");
      res.redirect("/");
    }
  });
} else {
  List.findOneAndUpdate({name: listName}, {$pull: {items: {_id: checkedItemId}}}, function(err, foundList){
    if (!err){
      res.redirect("/" + listName);
    }
  });
}


});



  app.get("/about", function(req, res){
    res.render("about");
  });

  let port = process.env.PORT;
  if (port == null || port == "") {
    port = 3000;
  }

  app.listen(port, function() {
    console.log("Server started succesfully");
  });

  // Item.find(function(err, items){
  //   if (err) {
  //     console.log(err);
  //   } else {
  //
  //     mongoose.connection.close(function () {
  //        process.exit(0);
  //     });
  //
  //     items.forEach(function(item){
  //       console.log(item.name);
  //     });
  //   }
  // });

}
