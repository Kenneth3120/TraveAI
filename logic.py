$scope.credFilter = function (cred) {
  const name = cred.name?.toLowerCase() || '';
  const type = cred.summary_fields?.credential_type?.name || '';
  const org = cred.summary_fields?.organization?.name || '';

  const matchesName = !$scope.filterName || name.includes($scope.filterName.toLowerCase());
  const matchesType = !$scope.filterType || type === $scope.filterType;
  const matchesOrg = !$scope.filterInstance || org === $scope.filterInstance;

  return matchesName && matchesType && matchesOrg;
};