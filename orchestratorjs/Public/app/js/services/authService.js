var app = angular.module( 'ojsConsole.services.AuthService', [] );


app.factory( 'AuthService', [ '$rootScope', '$location', '$templateCache', 'UserService',

	function( $rootScope, $location, $templateCache, UserService ) {

		// bind listener for route change to authorize
		$rootScope.$on( '$routeChangeSuccess', function( event, currRoute, prevRoute ) {

			if ( currRoute && currRoute.$$route.access && !currRoute.$$route.access.isFree && !UserService.isLogged ) {


				var currentPageTemplate = currRoute.loadedTemplateUrl;
				console.log( currentPageTemplate );
				$templateCache.remove( currentPageTemplate );

				// save path for redirecting after login
				$rootScope.nextPath = currRoute.$$route.originalPath;

				$location.path( '/signIn' );

			}

		} );

		return;
	}
] );