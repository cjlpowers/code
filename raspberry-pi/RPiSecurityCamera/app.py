# import the necessary packages
from imutils.video import VideoStream
import argparse
import datetime
import imutils
import time
import cv2

def detectObjects( frame1, frame2 ):
	# compute the absolute difference between the current frame and
	# background frame
	frameDelta = cv2.absdiff(frame1, frame2)
	thresh = cv2.threshold(frameDelta, 40, 255, cv2.THRESH_BINARY)[1]

	# dilate the thresholded image to fill in holes, then find contours
	# on thresholded image
	thresh = cv2.dilate(thresh, None, iterations=3)
	cnts = cv2.findContours(thresh, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)
	cnts = cnts[0] if imutils.is_cv2() else cnts[1]

	return [c for c in cnts if cv2.contourArea(c) >= args["min_area"]]

def log(str):
	print("{0}: {1}".format(datetime.datetime.now(), str))

# construct the argument parser and parse the arguments
ap = argparse.ArgumentParser()
ap.add_argument("-v", "--video", help="path to the video file")
ap.add_argument("-a", "--min-area", type=int, default=200, help="minimum area size")
args = vars(ap.parse_args())

# if the video argument is None, then we are reading from webcam
if args.get("video", None) is None:
	vs = VideoStream(src=0).start()
	time.sleep(2.0)

# otherwise, we are reading from a video file
else:
	vs = cv2.VideoCapture(args["video"])

# initialize the background frame in the video stream
backGray = None
backTime = None
newBackGray = None
newBackTime = None
prevGray = None
frameCount = 0

# loop over the frames of the video
while True:
	# grab the current frame and initialize the occupied/unoccupied
	# text
	frame = vs.read()
	frameCount = frameCount + 1
	frame = frame if args.get("video", None) is None else frame[1]
	text = "Unoccupied"

	# if the frame could not be grabbed, then we have reached the end
	# of the video
	if frame is None:
		break

	# resize the frame, convert it to frameGrayscale, and blur it
	frame = imutils.resize(frame, width=500)
	frameGray = cv2.cvtColor(frame, cv2.COLOR_BGR2GRAY)
	frameGray = cv2.GaussianBlur(frameGray, (11, 11), 0)

	# if the background frame is None, initialize it
	if backGray is None:
		backGray = frameGray
		backTime = time.clock()
		continue

	# compute the absolute difference between the current frame and
	# background frame
	objects = detectObjects(backGray, frameGray)
	
	if len(objects) > 0:
		log("Frame {0}: Detected {1} object(s)...".format(frameCount, len(objects)))

		# loop over the contours
		for c in objects:
			# compute the bounding box for the contour, draw it on the frame,
			# and update the text
			(x, y, w, h) = cv2.boundingRect(c)
			cv2.rectangle(frame, (x, y), (x + w, y + h), (0, 255, 0), 2)
			text = "Occupied"

	#else:
		#log("Frame {0}: No object(s)...".format(frameCount))

	# see if we detect objects from the previous frame
	if newBackGray is not None:
		objects = detectObjects(frameGray, newBackGray)
		if len(objects) == 0:
			if time.clock() - newBackTime > 1.0:
				# update the backgrond frame if we have not detected objets in awhile
				log("Frame {0}: Updating background frame".format(frameCount))
				backGray = newBackGray
				backTime = time.clock()
				newBackGray = None
				newBackTime = None
		else:
			newBackGray = None
			newBackTime = None			
	elif prevGray is not None:
		objects = detectObjects(frameGray, prevGray)
		if len(objects) == 0:			
			newBackGray = prevGray
			newBackTime = time.clock()

	prevGray = frameGray
		
	# draw the text and timestamp on the frame
	#cv2.putText(frame, "Room Status: {}".format(text), (10, 20), cv2.FONT_HERSHEY_SIMPLEX, 0.5, (0, 0, 255), 2)
	#cv2.putText(frame, datetime.datetime.now().strftime("%A %d %B %Y %I:%M:%S%p"), (10, frame.shape[0] - 10), cv2.FONT_HERSHEY_SIMPLEX, 0.35, (0, 0, 255), 1)
	
	#cv2.imwrite("./output/frame_%d.jpg"%frameCount, frame)

	# show the frame and record if the user presses a key
	##cv2.imshow("Security Feed", frame)
	##cv2.imshow("Thresh", thresh)
	##cv2.imshow("Frame Delta", frameDelta)
	##key = cv2.waitKey(1) & 0xFF

	# if the `q` key is pressed, break from the lop
	##if key == ord("q"):
	##	break

# cleanup the camera and close any open windows
vs.stop() if args.get("video", None) is None else vs.release()
#cv2.destroyAllWindows()