import esbuild from 'esbuild';

const isProduction = process.env.NODE_ENV === 'production';

const prodBuild = () => {
    return esbuild.build({
        entryPoints: ['src/index.ts'],
        bundle: true,
        minify: true,
        target: ['es2020'],
        outfile: 'public/bundle.min.js',
        format: 'esm',
        platform: 'node',
        external: ['./node_modules/*'],
        sourcemap: false,
        loader: {
            '.ts': 'ts'
        }
    });
};

if (isProduction) {
    prodBuild()
        .then(() => {
            console.log('Production build complete!');
        })
        .catch((error) => {
            console.error(error);
            process.exit(1);
        });
} else {
    console.log('Use Tsc for dev build!');
}
