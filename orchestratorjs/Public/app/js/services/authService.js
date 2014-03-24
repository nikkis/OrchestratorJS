var app = angular.module( 'ojsConsole.services.AuthService', [] );


app.factory( 'AuthService', [ '$rootScope', '$location', '$templateCache', 'UserService',

	function( $rootScope, $location, $templateCache, UserService ) {

		// bind listener for route change to authorize
		$rootScope.$on( '$routeChangeSuccess', function( event, currRoute, prevRoute ) {

			if ( currRoute && currRoute.$$route.access && !currRoute.$$route.access.isFree && !UserService.isLogged ) {

				var currentPageTemplate = currRoute.loadedTemplateUrl;
				$templateCache.remove( currentPageTemplate );

				// save path for redirecting after login
				var op = currRoute.$$route.originalPath;
				for ( paramName in currRoute.pathParams )
					op = op.replace(':'+paramName, currRoute.pathParams[paramName]);
				$rootScope.nextPath = op;

				$location.path( '/signIn' );
			}

		} );

		return;
	}
] );