import { spawn, ChildProcess } from 'child_process';
import del from 'del';
import gulp from 'gulp';
import ts from 'gulp-typescript';
import sourcemaps from 'gulp-sourcemaps';

const SRC_FOLDER = 'src/**/*.ts';
const BUILD_FOLDER = 'build';
let watcherProcess: ChildProcess;

// Build the project for development
gulp.task('buildProject', buildDevProject);
gulp.task('build', gulp.series(cleanOutputFolder, 'buildProject'));

gulp.task('watch', () => {
  gulp.watch([SRC_FOLDER], buildDevProject);
  gulp.watch([`${BUILD_FOLDER}/**/*.js`], { ignoreInitial: false }, startProject)
});

// Delete all items in the output folder
function cleanOutputFolder () {
  return del([
    `${BUILD_FOLDER}/**/*`,
  ]);
}

// Build a project with sourcemaps
function buildProject(tsProject: ts.Project) {
  return gulp
  .src(SRC_FOLDER)
  .pipe(sourcemaps.init())
  .pipe(tsProject())
  .js
  .pipe(sourcemaps.write())
  .pipe(gulp.dest(BUILD_FOLDER));
}

function buildDevProject() {
  return buildProject(ts.createProject('tsconfig.json'));
}

function startProject() {
  if (watcherProcess) {
    watcherProcess.kill();
  }
  watcherProcess = spawn('node', [`${BUILD_FOLDER}/index.js`], { stdio: 'inherit' });
  return Promise.resolve();
}