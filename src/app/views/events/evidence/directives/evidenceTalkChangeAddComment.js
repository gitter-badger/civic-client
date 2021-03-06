(function() {
  'use strict';
  angular.module('civic.events')
    .directive('evidenceTalkChangeAddComment', evidenceTalkChangeAddComment)
    .controller('EvidenceTalkChangeAddCommentController', EvidenceTalkChangeAddCommentController);

  // @ngInject
  function evidenceTalkChangeAddComment() {
    var directive = {
      restrict: 'E',
      replace: true,
      templateUrl: 'app/views/events/evidence/directives/evidenceTalkChangeAddComment.tpl.html',
      controller: 'EvidenceTalkChangeAddCommentController',
      link: /* @ngInject */ function($scope, Security) {
        $scope.isAuthenticated = Security.isAuthenticated;
        $scope.isAdmin = Security.isAdmin;
      }
    };
    return directive;
  }

  // @ngInject
  function EvidenceTalkChangeAddCommentController($scope, $stateParams, EvidenceSuggestedChangesComments, $log) {
    $log.info('EvidenceTalkChangeAddCommentController instantiated.==========');

    $scope.comment = {};

    $scope.formStatus = {
      errors: [],
      messages: []
    };

    $scope.submitComment = function() {
      $log.info('submitComment called. ' +
      'geneId: '+ $stateParams.geneId +
      ' variantId: '+ $stateParams.variantId +
      ' suggestedChangeId: ' + $stateParams.suggestedChangeId);
      EvidenceSuggestedChangesComments.add({
          geneId: $stateParams.geneId,
          variantId: $stateParams.variantId,
          evidenceItemId: $stateParams.evidenceItemId,
          suggestedChangeId: $stateParams.suggestedChangeId,
          title: "TESTING",
          text: $scope.comment.text
        },
        function(response) { // add comment succeeded
          $log.info('add comment succeeded.');
          $scope.formStatus.errors = [];
          $scope.formStatus.messages = [];
          $scope.comment = '';
          $scope.formStatus.messages.push('Your comment was added.');

          EvidenceSuggestedChangesComments.query({
            geneId: $scope.gene.entrez_id,
            variantId: $scope.variant.id,
            evidenceItemId: $stateParams.evidenceItemId,
            suggestedChangeId: $stateParams.suggestedChangeId
          }).$promise
            .then(function(response) { // success!
              // TODO: refactor this icky $parent call
              $scope.$parent.changeComments = response;
            }, function(response) { // FAIL!
              $scope.formStatus.messages.push('Failed to load new updated comments');
          });
        },
        function(response) { // add comment failed
          $log.info('add comment failed.');
          $scope.formStatus.messages = [];
          $scope.formStatus.errors = [];
          var handleError = {
            '401': function () {
              $scope.formStatus.errors.push({
                field: 'Unauthrorized',
                errorMsg: 'You must be logged in to perform this action.'
              });
            },
            '403': function () {
              $scope.formStatus.errors.push({
                field: 'Insufficient Permissions',
                errorMsg: 'You must be an Admin user to perform the requested action.'
              });
            },
            '404': function () {
              $scope.formStatus.errors.push({
                field: 'Unknown Route',
                errorMsg: 'The CIViC service requested an invalid URL.'
              });
            },
            '422': function (response) {
              _.forEach(response.data.errors, function (value, key) {
                $scope.formStatus.errors.push({
                  field: key,
                  errorMsg: value
                });
              });
            },
            '500': function(response) {
              $scope.formStatus.errors.push({
                field: 'SERVER ERROR',
                errorMsg: response.statusText
              });
              $log.info(response);
            }
          };
          handleError[response.status](response);
        }
      );
    };
  }
})();
