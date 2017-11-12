"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
var core_1 = require("@angular/core");
var user_service_1 = require("../Service/user.service");
var forms_1 = require("@angular/forms");
var ng2_bs3_modal_1 = require("ng2-bs3-modal/ng2-bs3-modal");
var enum_1 = require("../Shared/enum");
var global_1 = require("../Shared/global");
var shoppingCart_1 = require("../Model/shoppingCart"); //Add
var userItem_1 = require("../Model/userItem");
var UserComponent = (function () {
    function UserComponent(fb, _userService) {
        this.fb = fb;
        this._userService = _userService;
        this.selectedUsers = [];
        this.indLoading = false;
    }
    UserComponent.prototype.ngOnInit = function () {
        this.userFrm = this.fb.group({
            Id: [''],
            FirstName: ['', forms_1.Validators.required],
            LastName: [''],
            Gender: ['', forms_1.Validators.required]
        });
        this.LoadUsers();
        this.LoadShoppingCart();
    };
    //add
    UserComponent.prototype.checkboxChange = function (userIdString) {
        var userId = parseInt(userIdString);
        var x = userId;
        for (var i = 0; i < this.selectedUsers.length; i++) {
            if (this.selectedUsers[i].Id == userId) {
                this.selectedUsers.splice(i, 1);
                return;
            }
        }
        //if user is not in selected user list
        //find the user with userId first
        var currentselectedUser = this.findUserById(userId);
        if (currentselectedUser != null) {
            this.selectedUsers.push(currentselectedUser);
        }
    };
    UserComponent.prototype.findUserById = function (userId) {
        for (var i = 0; i < this.users.length; i++) {
            if (this.users[i].Id == userId) {
                return this.users[i];
            }
        }
        return null;
    };
    //add
    UserComponent.prototype.LoadShoppingCart = function () {
        this.currentUser = JSON.parse(sessionStorage.getItem("currentUser")); //session storage is expired
        var selectedUserItemList = this.convertUserListToUserItemList(this.selectedUsers);
        this.currentShoppingCart = JSON.parse(localStorage.getItem("currentShoppingCart" + this.currentUser.Id)); //local storage never expire
    };
    UserComponent.prototype.LoadUsers = function () {
        var _this = this;
        this.indLoading = true;
        this._userService.get(global_1.Global.BASE_USER_ENDPOINT)
            .subscribe(function (users) { _this.users = users; _this.indLoading = false; }, function (error) { return _this.msg = error; });
    };
    //add
    UserComponent.prototype.purchaseItems = function () {
        //currentUser is already log in, so we retrieve currentUserId first
        //check if this user has a shopping cart already
        this.currentUser = JSON.parse(sessionStorage.getItem("currentUser")); //session storage is expired
        var selectedUserItemList = this.convertUserListToUserItemList(this.selectedUsers);
        this.currentShoppingCart = JSON.parse(localStorage.getItem("currentShoppingCart" + this.currentUser.Id)); //local storage never expire
        if (this.currentShoppingCart == null) {
            this.currentShoppingCart = new shoppingCart_1.shoppingCart();
            this.currentShoppingCart.userId = this.currentUser.Id;
            this.currentShoppingCart.userItemList = selectedUserItemList;
        }
        else {
            this.currentShoppingCart.userItemList = this.mergeItemList(this.currentShoppingCart.userItemList, selectedUserItemList);
        }
        localStorage.setItem("currentShoopingCart" + this.currentUser.Id, JSON.stringify(this.currentShoppingCart));
    };
    UserComponent.prototype.convertUserListToUserItemList = function (selectedUsers) {
        var userItemList = [];
        for (var i = 0; i < selectedUsers.length; i++) {
            var tempUserItem = new userItem_1.userItem();
            tempUserItem.Quantity = 1;
            tempUserItem.user = selectedUsers[i];
            tempUserItem.SubTotal = 10.00 * tempUserItem.Quantity;
            userItemList.push(tempUserItem);
        }
        return userItemList;
    };
    UserComponent.prototype.mergeItemList = function (existingItems, newItemList) {
        var matchingFlag = false;
        for (var i = 0; i < existingItems.length; i++) {
            var CurrentItem = existingItems[i];
            matchingFlag = false;
            for (var j = 0; j < newItemList.length; j++) {
                if (CurrentItem.user.Id == newItemList[j].user.Id) {
                    matchingFlag = true;
                    newItemList[j].Quantity = CurrentItem.Quantity + newItemList[j].Quantity;
                    break;
                }
            }
            //end of for loop, find existing index = i, does not match any new items
            if (!matchingFlag) {
                newItemList.push(CurrentItem);
            }
        }
        return newItemList;
    };
    UserComponent.prototype.addUser = function () {
        this.dbops = enum_1.DBOperation.create;
        this.SetControlsState(true);
        this.modalTitle = "Add New User";
        this.modalBtnTitle = "Add";
        this.userFrm.reset();
        this.modal.open();
    };
    UserComponent.prototype.editUser = function (id) {
        this.dbops = enum_1.DBOperation.update;
        this.SetControlsState(true);
        this.modalTitle = "Edit User";
        this.modalBtnTitle = "Update";
        this.user = this.users.filter(function (x) { return x.Id == id; })[0];
        this.userFrm.setValue(this.user);
        this.modal.open();
    };
    UserComponent.prototype.deleteUser = function (id) {
        this.dbops = enum_1.DBOperation.delete;
        this.SetControlsState(false);
        this.modalTitle = "Confirm to Delete?";
        this.modalBtnTitle = "Delete";
        this.user = this.users.filter(function (x) { return x.Id == id; })[0];
        this.userFrm.setValue(this.user);
        this.modal.open();
    };
    UserComponent.prototype.onSubmit = function (formData) {
        var _this = this;
        this.msg = "";
        switch (this.dbops) {
            case enum_1.DBOperation.create:
                this._userService.post(global_1.Global.BASE_USER_ENDPOINT, formData._value).subscribe(function (data) {
                    if (data == 1) {
                        _this.msg = "Data successfully added.";
                        _this.LoadUsers();
                        _this.LoadShoppingCart();
                    }
                    else {
                        _this.msg = "There is some issue in saving records, please contact to system administrator!";
                    }
                    _this.modal.dismiss();
                }, function (error) {
                    _this.msg = error;
                });
                break;
            case enum_1.DBOperation.update:
                this._userService.put(global_1.Global.BASE_USER_ENDPOINT, formData._value.Id, formData._value).subscribe(function (data) {
                    if (data == 1) {
                        _this.msg = "Data successfully updated.";
                        _this.LoadUsers();
                    }
                    else {
                        _this.msg = "There is some issue in saving records, please contact to system administrator!";
                    }
                    _this.modal.dismiss();
                }, function (error) {
                    _this.msg = error;
                });
                break;
            case enum_1.DBOperation.delete:
                this._userService.delete(global_1.Global.BASE_USER_ENDPOINT, formData._value.Id).subscribe(function (data) {
                    if (data == 1) {
                        _this.msg = "Data successfully deleted.";
                        _this.LoadUsers();
                    }
                    else {
                        _this.msg = "There is some issue in saving records, please contact to system administrator!";
                    }
                    _this.modal.dismiss();
                }, function (error) {
                    _this.msg = error;
                });
                break;
        }
    };
    UserComponent.prototype.SetControlsState = function (isEnable) {
        isEnable ? this.userFrm.enable() : this.userFrm.disable();
    };
    UserComponent.prototype.criteriaChange = function (value) {
        if (value != '[object Event]')
            this.listFilter = value;
    };
    return UserComponent;
}());
__decorate([
    core_1.ViewChild('modal'),
    __metadata("design:type", ng2_bs3_modal_1.ModalComponent)
], UserComponent.prototype, "modal", void 0);
UserComponent = __decorate([
    core_1.Component({
        templateUrl: 'app/Components/user.component.html'
    }),
    __metadata("design:paramtypes", [forms_1.FormBuilder, user_service_1.UserService])
], UserComponent);
exports.UserComponent = UserComponent;
//# sourceMappingURL=user.component.js.map
