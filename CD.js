$scope.credFilter = function (cred) {
  const name = cred.name?.toLowerCase() || '';
  const type = cred.summary_fields?.credential_type?.name || '';
  const org = cred.summary_fields?.organization?.name || '';

  const matchesName = !$scope.filterName || name.includes($scope.filterName.toLowerCase());
  const matchesType = !$scope.filterType || type === $scope.filterType;
  const matchesOrg = !$scope.filterInstance || org === $scope.filterInstance;

  return matchesName && matchesType && matchesOrg;
};

// Add a watch to update filtered count
$scope.$watchGroup(['filterName', 'filterType', 'filterInstance', 'credentials'], function () {
  if ($scope.credentials) {
    $scope.filteredCredentials = $scope.credentials.filter($scope.credFilter);
  }
});


<div class="cred-count-box">
  <h3 class="cred-heading">
    Showing {{ filteredCredentials.length }} of {{ totalCredentials }} Credentials
  </h3>
</div>



.cred-count-box {
  text-align: center;
  margin: 1rem 0;
  background-color: #ede9f4;
  color: #4c367c;
  padding: 12px;
  border-radius: 12px;
  font-weight: bold;
  box-shadow: 0 0 8px rgba(108, 92, 231, 0.1);
}

.cred-heading {
  margin: 0;
  font-size: 1.2rem;
}






angular.module('towerAdminApp')
.controller('UserMgmtController',function($scope,UserService,$rootScope){
  $scope.currentUser = $rootScope.currentUser;
  $scope.users = [];
  $scope.newUser = {username:'',email:'',role:'viewer'};
  $scope.showAddForm = false;

  function load(){
    UserService.list().then(data=>$scope.users=data);
  }
  load();

  $scope.addUser = function(){
    UserService.create($scope.newUser)
      .then(()=>{ load(); $scope.showAddForm=false; });
  };
  $scope.updateUser = function(user){
    UserService.update(user).then(()=>load());
  };
  $scope.deleteUser = function(id){
    if(confirm('Delete user?')) UserService.delete(id).then(()=>load());
  };
});
