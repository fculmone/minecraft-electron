import * as React from 'react';

function MinecraftBlockIcon({
  className,
  ...props
}: { className?: string } & React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      width="800px"
      height="800px"
      viewBox="0 0 48 48"
      id="b"
      xmlns="http://www.w3.org/2000/svg"
      fill="currentColor"
      stroke="currentColor"
      strokeWidth={2.4}
      className={className}
      {...props}
    >
      <g id="SVGRepo_iconCarrier">
        <defs>
          <style>
            {
              '.d{fill:none;stroke:currentColor;stroke-linecap:round;stroke-linejoin:round}'
            }
          </style>
        </defs>
        <g
          style={{
            isolation: 'isolate',
          }}
        >
          <path
            className="d"
            d="M40.9004 14.2733L40.8452 33.7266 24.0274 43.5 24.0826 24.0467 40.9004 14.2733z"
          />
          <path
            className="d"
            d="M24.0826 24.0467L24.0274 43.5 7.0996 33.7267 7.1548 14.2734 24.0826 24.0467z"
          />
          <path
            className="d"
            d="M40.9004 14.2733L24.0826 24.0467 7.1548 14.2734 23.9726 4.5 40.9004 14.2733z"
          />
        </g>
      </g>
    </svg>
  );
}

function CloudIcon({
  className,
  ...props
}: { className?: string } & React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      width="800px"
      height="800px"
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      {...props}
    >
      <path
        d="M3 13.65C3 16.603 5.418 19 8.4 19h8.1c2.485 0 4.5-2.016 4.5-4.503 0-1.847-1.11-3.552-2.7-4.247C18.132 7.323 15.684 5 12.69 5 10.35 5 8.346 6.486 7.5 8.5 4.8 8.938 3 11.2 3 13.65z"
        stroke="currentColor"
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function DashboardIcon({
  className,
  ...props
}: { className?: string } & React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      width="800px"
      height="800px"
      viewBox="0 -0.5 25 25"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      {...props}
    >
      <path
        clipRule="evenodd"
        d="M9.918 10H7.082A1.57 1.57 0 005.5 11.556v5.89A1.569 1.569 0 007.082 19h2.836a1.569 1.569 0 001.582-1.555v-5.889a1.569 1.569 0 00-1.582-1.555zM9.918 4H7.082A1.54 1.54 0 005.5 5.495v1.014A1.54 1.54 0 007.082 8h2.836A1.54 1.54 0 0011.5 6.508V5.494A1.54 1.54 0 009.918 4zM15.082 13h2.835a1.57 1.57 0 001.583-1.555V5.557A1.569 1.569 0 0017.918 4h-2.836A1.57 1.57 0 0013.5 5.557v5.888A1.569 1.569 0 0015.082 13zM15.082 19h2.835a1.54 1.54 0 001.583-1.492v-1.014A1.54 1.54 0 0017.918 15h-2.836a1.54 1.54 0 00-1.582 1.493v1.013A1.54 1.54 0 0015.082 19z"
        stroke="currentColor"
        strokeWidth={1.5}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function JavaIcon({
  className,
  ...props
}: { className?: string } & React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      width="800px"
      height="800px"
      viewBox="0 0 16 16"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      {...props}
    >
      <path
        d="M4.453.77a.753.753 0 011.06-.096c.76.634 1.056 1.383.893 2.121-.14.63-.577 1.078-.918 1.316-.214.183-.303.326-.34.416a.32.32 0 00-.022.202c.031.142.167.31.323.414a.753.753 0 11-.836 1.253c-.346-.23-.813-.69-.957-1.342-.163-.739.132-1.487.893-2.121l.03-.026.034-.022c.156-.104.291-.273.323-.415a.32.32 0 00-.023-.202c-.038-.092-.132-.244-.364-.437a.753.753 0 01-.096-1.06zm4.67 2.008a.753.753 0 01-.097 1.06c-.232.194-.326.345-.364.438a.32.32 0 00-.023.202c.032.142.167.31.323.414a.753.753 0 11-.835 1.253c-.347-.23-.814-.69-.958-1.342-.163-.739.132-1.487.893-2.121a.753.753 0 011.06.096zM.207 7.595a.753.753 0 01.73-.57h11.558c.346 0 .647.234.73.57.11.435.137.99.078 1.612h1.843c.416 0 .753.338.753.753 0 .74-.045 1.936-.797 2.938-.74.988-2.03 1.622-4.093 1.69-.27.338-.566.672-.892.999a.753.753 0 01-.533.22H3.85c-.2 0-.391-.08-.532-.22-1.45-1.45-2.317-3.05-2.78-4.472C.084 9.717 0 8.425.208 7.595zm9.06 6.707c.281-.3.536-.604.764-.91.933-1.251 1.438-2.534 1.659-3.586.105-.503.142-.936.137-1.276H1.606c-.008.526.085 1.263.363 2.12a9.755 9.755 0 002.198 3.652h5.1zm2.825-1.338c1.004-.195 1.521-.59 1.806-.97.28-.373.405-.818.459-1.28h-1.34c-.198.71-.499 1.475-.925 2.25z"
        fill="currentColor"
      />
    </svg>
  );
}

function MinecraftWorldIcon({
  className,
  ...props
}: { className?: string } & React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      width="800px"
      height="800px"
      viewBox="0 0 48 48"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      {...props}
    >
      <defs>
        <style>
          {
            '.a{fill:currentColor;fill-opacity:0;stroke:currentColor;stroke-linecap:round;stroke-linejoin:round}'
          }
        </style>
      </defs>
      <path className="a" d="M43 31.827L24.016 43.049 5 32.07V21.222" />
      <path
        className="a"
        d="M9.552 29.275L7.744 28.23v5.424l9.782 5.647v-1.808l-1.566-.904v-1.808l-1.888-1.09v-3.616l-4.52-2.61z"
      />
      <path
        className="a"
        d="M17.688 39.396l-9.556-5.518 3.137-1.742 2.803 1.556M34.864 17.093l-2.665-1.87-6.056 3.653 4.201 2.515V23.2l5.96 3.447 3.136-1.808L43 22.787l-5.424-3.815M32.199 15.222l-.047-1.827"
      />
      <path
        className="a"
        d="M11.245 17.596L5 21.223l12.688 7.325 12.656-7.157-5.78-3.466 7.588-4.53-6.797-3.924-4.712 2.914M30.344 23.2l-12.656 7.156v1.808l1.404.81v1.808l4.924 2.843 10.848-6.393v-1.94l1.512-.872-.071-1.773"
      />
      <path
        className="a"
        d="M12.803 18.495l.026 3.821 1.566.714 1.565-.714V20.51l-.023-1.993-1.542.899"
      />
      <path
        className="a"
        d="M7.744 15.575l6.65 3.84 6.006-3.468V8.418l-6.005-3.467-6.65 3.839zM34.864 22.193l1.451.837 1.261-.728V14.72l-1.26-.728-1.452.97zM43 25.499l-3.616 2.088v.904l-1.808 1.043v1.808l-1.808 1.044v3.616L43 31.827z"
      />
      <path
        fill="none"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M17.6883 28.548L17.6883 30.356"
      />
    </svg>
  );
}

export {
  MinecraftBlockIcon,
  CloudIcon,
  JavaIcon,
  MinecraftWorldIcon,
  DashboardIcon,
};
