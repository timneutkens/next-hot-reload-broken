const path = require('path');
const withTypescript = require('@zeit/next-typescript');

// Generate custom include/exclude config for our module loaders.
// These allow us to transpile code from specific linked packages.
const transpile = ['@demo/linked'];
const includes = transpile.map(
  module => new RegExp(`${module}(?!.*node_modules)`)
);
const excludes = transpile.map(
  module => new RegExp(`node_modules(?!\/${module}(?!.*node_modules))`)
);

module.exports = withTypescript({
  webpack: (config, { dev }) => {
    // Allow linked dependencies to use our node modules.
    config.resolve.modules.unshift(
      path.resolve(process.cwd(), 'node_modules')
    );

    // Properly resolve symlinks.
    config.resolve.symlinks = false;

    // Required for enabling externals from linked packages.
    config.externals = config.externals.map(external => {
      if (typeof external !== 'function') {
        return external;
      }

      return (ctx, req, cb) => {
        return !!includes.find(include => include.test(req))
          ? cb()
          : external(ctx, req, cb);
      };
    });

    config.module.rules.map(rule => {
      // Add our custom include rules including linked node modules.
      rule.include = [].concat(
        rule.include || [path.resolve(process.cwd())],
        includes
      );
      // Add our custom exclude rules for white-listing linked node modules.
      rule.exclude = []
        .concat(rule.exclude || [], excludes)
        .filter(exclude => {
          // Remove all exclude rules that would eliminate our linked modules.
          return !!transpile.find(
            module => !exclude.test(`node_modules/${transpile}`)
          );
        });

      return rule;
    });

    return config;
  },
  webpackDevMiddleware: config => {
    config.watchOptions.ignored = [config.watchOptions.ignored[0]].concat(
      excludes
    );

    return config;
  },
});
